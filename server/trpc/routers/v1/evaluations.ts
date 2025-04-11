import { z } from "zod";
import { router } from '@/server/trpc/trpc'
import { authorizedProcedure } from "~/server/trpc/procedures/authorized";
import { serverSupabaseClient } from "#supabase/server";
import { TRPCError } from '@trpc/server';

// Define validation schemas
const createEvaluationSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  evaluatorId: z.string().uuid('Invalid evaluator ID'),
  templateId: z.string().uuid('Invalid template ID'),
  departmentId: z.string().uuid('Invalid department ID').optional().nullable(),
  evaluationDate: z.string().min(1, 'Evaluation date is required'),
  status: z.enum(['draft', 'in_progress', 'completed', 'reviewed']).default('draft'),
  overallScore: z.number().min(0).max(5).optional().nullable(),
  strengths: z.string().optional().nullable(),
  areasToImprove: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  scores: z.array(z.object({
    criteriaId: z.string().uuid('Invalid criteria ID'),
    score: z.number().min(0).max(5),
    comments: z.string().optional().nullable()
  })).optional()
});

const updateEvaluationSchema = z.object({
  id: z.string().uuid('Invalid evaluation ID'),
  evaluatorId: z.string().uuid('Invalid evaluator ID').optional(),
  templateId: z.string().uuid('Invalid template ID').optional(),
  departmentId: z.string().uuid('Invalid department ID').optional().nullable(),
  evaluationDate: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'reviewed']).optional(),
  overallScore: z.number().min(0).max(5).optional().nullable(),
  strengths: z.string().optional().nullable(),
  areasToImprove: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
});

export default router({
  // List all evaluations (with optional filters)
  list: authorizedProcedure
    .input(z.object({
      employeeId: z.string().uuid('Invalid employee ID').optional(),
      evaluatorId: z.string().uuid('Invalid evaluator ID').optional(),
      status: z.enum(['draft', 'in_progress', 'completed', 'reviewed']).optional(),
      departmentId: z.string().uuid('Invalid department ID').optional()
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        // First, get the evaluations
        let evaluationsQuery = client
          .from('evaluations')
          .select('*')
          .order('evaluation_date', { ascending: false });
        
        // Apply filters if provided
        if (input?.employeeId) {
          evaluationsQuery = evaluationsQuery.eq('employee_id', input.employeeId);
        }
        
        if (input?.evaluatorId) {
          evaluationsQuery = evaluationsQuery.eq('evaluator_id', input.evaluatorId);
        }
        
        if (input?.status) {
          evaluationsQuery = evaluationsQuery.eq('status', input.status);
        }
        
        if (input?.departmentId) {
          evaluationsQuery = evaluationsQuery.eq('department_id', input.departmentId);
        }
        
        const { data: evaluations, error } = await evaluationsQuery;
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          });
        }

        // If no evaluations, return empty array
        if (!evaluations || evaluations.length === 0) {
          return [];
        }

        // Collect unique IDs to fetch related data
        const employeeIds = [...new Set(evaluations.map(e => e.employee_id))];
        const evaluatorIds = [...new Set(evaluations.map(e => e.evaluator_id))];
        const templateIds = [...new Set(evaluations.map(e => e.template_id))];
        const departmentIds = [...new Set(evaluations.map(e => e.department_id).filter(Boolean))];

        // Fetch related data separately
        const [employeesResult, evaluatorsResult, templatesResult, departmentsResult] = await Promise.all([
          employeeIds.length > 0 ? client
            .from('employee_details')
            .select('id, first_name, last_name, email')
            .in('id', employeeIds) : Promise.resolve({ data: [] }),
          
          evaluatorIds.length > 0 ? client
            .from('employee_details')
            .select('id, first_name, last_name, email')
            .in('id', evaluatorIds) : Promise.resolve({ data: [] }),
          
          templateIds.length > 0 ? client
            .from('evaluation_templates')
            .select('id, title, description')
            .in('id', templateIds) : Promise.resolve({ data: [] }),
          
          departmentIds.length > 0 ? client
            .from('departments')
            .select('id, name')
            .in('id', departmentIds) : Promise.resolve({ data: [] })
        ]);

        // Convert related data to maps for easy lookup
        const employeesMap = new Map(employeesResult.data?.map(e => [e.id, e]) || []);
        const evaluatorsMap = new Map(evaluatorsResult.data?.map(e => [e.id, e]) || []);
        const templatesMap = new Map(templatesResult.data?.map(t => [t.id, t]) || []);
        const departmentsMap = new Map(departmentsResult.data?.map(d => [d.id, d]) || []);

        // Format the response with joined data
        const formattedData = evaluations.map(evaluation => {
          const employee = employeesMap.get(evaluation.employee_id);
          const evaluator = evaluatorsMap.get(evaluation.evaluator_id);
          const template = templatesMap.get(evaluation.template_id);
          const department = evaluation.department_id ? departmentsMap.get(evaluation.department_id) : null;

          return {
            id: evaluation.id,
            employeeId: evaluation.employee_id,
            employeeName: employee ? 
              `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : 
              'Unknown',
            evaluatorId: evaluation.evaluator_id,
            evaluatorName: evaluator ? 
              `${evaluator.first_name || ''} ${evaluator.last_name || ''}`.trim() : 
              'Unknown',
            templateId: evaluation.template_id,
            templateTitle: template?.title || 'Unknown Template',
            departmentId: evaluation.department_id,
            departmentName: department?.name || null,
            evaluationDate: evaluation.evaluation_date,
            status: evaluation.status,
            overallScore: evaluation.overall_score,
            strengths: evaluation.strengths,
            areasToImprove: evaluation.areas_to_improve,
            comments: evaluation.comments,
            createdAt: evaluation.created_at,
            updatedAt: evaluation.updated_at
          };
        });
        
        return formattedData || [];
      } catch (error: any) {
        console.error('Evaluations List Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch evaluations'
        });
      }
    }),

  // Get a single evaluation by ID with its scores
  get: authorizedProcedure
    .input(z.object({ id: z.string().uuid('Invalid evaluation ID') }))
    .query(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        // Get evaluation details
        const { data: evaluation, error: evaluationError } = await client
          .from('evaluations')
          .select('*')
          .eq('id', input.id)
          .single();
        
        if (evaluationError) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Evaluation not found'
          });
        }

        // Fetch related data separately
        const [employeeResult, evaluatorResult, templateResult, departmentResult] = await Promise.all([
          client
            .from('employee_details')
            .select('id, first_name, last_name, email')
            .eq('id', evaluation.employee_id)
            .single()
            .catch(() => ({ data: null })),
          
          client
            .from('employee_details')
            .select('id, first_name, last_name, email')
            .eq('id', evaluation.evaluator_id)
            .single()
            .catch(() => ({ data: null })),
          
          client
            .from('evaluation_templates')
            .select('id, title, description')
            .eq('id', evaluation.template_id)
            .single()
            .catch(() => ({ data: null })),
          
          evaluation.department_id ? client
            .from('departments')
            .select('id, name, description')
            .eq('id', evaluation.department_id)
            .single()
            .catch(() => ({ data: null })) : Promise.resolve({ data: null })
        ]);

        // Get evaluation scores
        const { data: scores, error: scoresError } = await client
          .from('evaluation_scores')
          .select(`
            *,
            criteria:criteria_id(
              id,
              title,
              description,
              weight
            )
          `)
          .eq('evaluation_id', input.id);
        
        if (scoresError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: scoresError.message
          });
        }
        
        const employee = employeeResult.data;
        const evaluator = evaluatorResult.data;
        const template = templateResult.data;
        const department = departmentResult.data;
        
        // Format the evaluation data
        const formattedEvaluation = {
          id: evaluation.id,
          employeeId: evaluation.employee_id,
          employeeName: employee ? 
            `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : 
            'Unknown',
          evaluatorId: evaluation.evaluator_id,
          evaluatorName: evaluator ? 
            `${evaluator.first_name || ''} ${evaluator.last_name || ''}`.trim() : 
            'Unknown',
          templateId: evaluation.template_id,
          templateTitle: template?.title || 'Unknown Template',
          templateDescription: template?.description,
          departmentId: evaluation.department_id,
          departmentName: department?.name || null,
          evaluationDate: evaluation.evaluation_date,
          status: evaluation.status,
          overallScore: evaluation.overall_score,
          strengths: evaluation.strengths,
          areasToImprove: evaluation.areas_to_improve,
          comments: evaluation.comments,
          createdAt: evaluation.created_at,
          updatedAt: evaluation.updated_at,
          // Format the scores
          scores: scores?.map(score => ({
            id: score.id,
            criteriaId: score.criteria_id,
            criteriaTitle: score.criteria?.title || 'Unknown Criteria',
            criteriaDescription: score.criteria?.description,
            criteriaWeight: score.criteria?.weight || 1.0,
            score: score.score,
            comments: score.comments,
            createdAt: score.created_at,
            updatedAt: score.updated_at
          })) || []
        };
        
        return formattedEvaluation;
      } catch (error: any) {
        console.error('Evaluation Get Error:', error);
        throw new TRPCError({
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch evaluation'
        });
      }
    }),

  // Create a new evaluation
  create: authorizedProcedure
    .input(createEvaluationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        // Start a transaction so we can create the evaluation and scores together
        const { data, error } = await client
          .rpc('create_evaluation', {
            p_employee_id: input.employeeId,
            p_evaluator_id: input.evaluatorId,
            p_template_id: input.templateId,
            p_department_id: input.departmentId,
            p_evaluation_date: input.evaluationDate,
            p_status: input.status,
            p_overall_score: input.overallScore,
            p_strengths: input.strengths,
            p_areas_to_improve: input.areasToImprove,
            p_comments: input.comments,
            p_scores: input.scores ? JSON.stringify(input.scores) : null
          });
        
        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message
          });
        }
        
        return data;
      } catch (error: any) {
        console.error('Evaluation Create Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to create evaluation'
        });
      }
    }),

  // Update an existing evaluation
  update: authorizedProcedure
    .input(updateEvaluationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const updateData: any = {};
        
        // Only include fields that were provided in the input
        if (input.evaluatorId !== undefined) updateData.evaluator_id = input.evaluatorId;
        if (input.templateId !== undefined) updateData.template_id = input.templateId;
        if (input.departmentId !== undefined) updateData.department_id = input.departmentId;
        if (input.evaluationDate !== undefined) updateData.evaluation_date = input.evaluationDate;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.overallScore !== undefined) updateData.overall_score = input.overallScore;
        if (input.strengths !== undefined) updateData.strengths = input.strengths;
        if (input.areasToImprove !== undefined) updateData.areas_to_improve = input.areasToImprove;
        if (input.comments !== undefined) updateData.comments = input.comments;
        
        // Add updated timestamp
        updateData.updated_at = new Date().toISOString();
        
        const { data, error } = await client
          .from('evaluations')
          .update(updateData)
          .eq('id', input.id)
          .select()
          .single();
        
        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message
          });
        }
        
        return data;
      } catch (error: any) {
        console.error('Evaluation Update Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to update evaluation'
        });
      }
    }),

  // Delete an evaluation
  delete: authorizedProcedure
    .input(z.object({ id: z.string().uuid('Invalid evaluation ID') }))
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        // Delete the evaluation (scores will be deleted via cascade)
        const { error } = await client
          .from('evaluations')
          .delete()
          .eq('id', input.id);
        
        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message
          });
        }
        
        return { success: true };
      } catch (error: any) {
        console.error('Evaluation Delete Error:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to delete evaluation'
        });
      }
    }),
    
  // List available evaluation templates
  listTemplates: authorizedProcedure
    .query(async ({ ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        const { data, error } = await client
          .from('evaluation_templates')
          .select('*')
          .eq('is_active', true)
          .order('title');
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message
          });
        }
        
        return data || [];
      } catch (error: any) {
        console.error('Evaluation Templates Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch evaluation templates'
        });
      }
    }),
    
  // Get template details with criteria
  getTemplate: authorizedProcedure
    .input(z.object({ id: z.string().uuid('Invalid template ID') }))
    .query(async ({ input, ctx }) => {
      try {
        const client = await serverSupabaseClient(ctx.event);
        
        // Get template details
        const { data: template, error: templateError } = await client
          .from('evaluation_templates')
          .select('*')
          .eq('id', input.id)
          .single();
        
        if (templateError) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Template not found'
          });
        }
        
        // Get criteria for this template
        const { data: criteria, error: criteriaError } = await client
          .from('evaluation_criteria')
          .select('*')
          .eq('template_id', input.id)
          .order('sort_order');
        
        if (criteriaError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: criteriaError.message
          });
        }
        
        return {
          ...template,
          criteria: criteria || []
        };
      } catch (error: any) {
        console.error('Get Template Error:', error);
        throw new TRPCError({
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch template details'
        });
      }
    }),
});