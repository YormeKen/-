class Music {
  constructor() {
      this.clearLineSound = new Audio('P.mp3');
  }

  playClearLineSound() {
      this.clearLineSound.play();
  }
}

const music = new Music();
