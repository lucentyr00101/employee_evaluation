export default defineAppConfig({
  ui: {
    primary: 'green',
    input: {
      color: {
        white: {
          outline: 'focus:ring-blue-400 dark:focus:ring-blue-400'
        },
        gray: {
          outline: 'focus:ring-blue-400 dark:focus:ring-blue-400'
        }
      }
    },
    button: {
      variant: {
        solid: 'duration-300',
        outline: 'duration-300',
        soft: 'duration-300',
        ghost: 'duration-300',
        link: 'duration-300',
      }
    }
  }
})