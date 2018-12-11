export default class Mouse {
  constructor() {
    this.hijackRightClick()
  }

  hijackRightClick() {
    window.addEventListener('contextmenu', function() {
      arguments[0].preventDefault()
    }, false)
  }
}
