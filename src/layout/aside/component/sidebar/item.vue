<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  render (h, context) {
    const { icon, title } = context.props
    const vnodes = []

    if (icon) {
      vnodes.push(<i class={'el-icon-' + icon + ' icon'}/>)
    }

    if (title) {
      vnodes.push(<span slot='title' style="text-align:center;">{(title)}</span>)
    }
    return vnodes
  }
}
</script>
