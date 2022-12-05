/* Firebase */

firebase.initializeApp({
  apiKey: "AIzaSyBqUCCFOsGpHaYAMk7Lgpp1PeWC34lCS4s",
  authDomain: "tylergordonhill-c8339.firebaseapp.com",
  databaseURL: "https://tylergordonhill-c8339-default-rtdb.firebaseio.com",
  projectId: "tylergordonhill-c8339",
  storageBucket: "tylergordonhill-c8339.appspot.com",
  messagingSenderId: "10243950475",
  appId: "1:10243950475:web:ff9abba5961c2fc49c918e"
});

firebase.appCheck().activate('6LfVw0sjAAAAAN0-OJ7XqY-MmsV2dFz_uOAP2QET', true);

class Database {
  constructor(ref) {
    this.ref = ref;
  }
  parse(response) {
    if (response.exists()) {
      return response.val();
    } else {
      return "";
    }
  }
  get() {
    return new Promise((resolve, reject) => {
      this.ref.get().then((response) => {
        resolve(this.parse(response));
      }).catch((error) => {
        reject(error);
      });
    });
  }
  set(data) {
    return new Promise((resolve, reject) => {
      this.ref.set(data).then(resolve).catch((error) => {
        reject(error);
      });
    });
  }
  clear() {
    return new Promise((resolve, reject) => {
      this.ref.remove().then(resolve).catch((error) => {
        reject(error);
      });
    });
  }
  push(data) {
    return new Promise((resolve, reject) => {
      this.ref.push().set(data).then(resolve).catch((error) => {
        reject(error);
      });
    });
  }
  listen(callback) {
    this.ref.on('value', (response) => {
      callback(this.parse(response));
    });
  }
}

const responsesDatabase = new Database(firebase.database().ref('/responses'));
const hideDatabase = new Database(firebase.database().ref('/hide'));
const playersDatabase = new Database(firebase.database().ref('/players'));



/* Display */

class Display {
  constructor(displayElement) {
    this.displayElement = displayElement;
  }
  render() {}
  clear() {}
}

class ResponsesDisplay extends Display {
  constructor(displayElement, hideElement) {
    super(displayElement);
    this.hideElement = hideElement;
  }
  render(list) {
    this.hideElement.children[1].innerText = ' (' + Object.keys(list).length + ')';
    const responses = this.displayElement.getElementsByClassName('response');
    for (let i = 0; i < responses.length; i++) {
      responses[i].classList.add('old');
    }
    for (const key in list) {
      const p = document.createElement('p');
      p.classList.add('response');
      p.innerText = list[key].value;
      if (list[key].highlight) {
        p.classList.add('clicked');
      }
      p.addEventListener('click', () => {
        list[key].highlight = !list[key].highlight;
        responsesDatabase.set(list);
      });
      const oldResponses = this.displayElement.querySelectorAll('.response.old');
      let found = 0;
      for (let i = 0; i < oldResponses.length; i++) {
        if (oldResponses[i].innerText === list[key].value) {
          this.displayElement.insertBefore(p, oldResponses[i]);
          this.displayElement.removeChild(oldResponses[i]);
          found = 1;
          break;
        }
      }
      if (!found) {
        this.displayElement.append(p);
      }
    }
    const oldResponses = this.displayElement.querySelectorAll('.response.old');
    for (let i = 0; i < oldResponses.length; i++) {
      this.displayElement.removeChild(oldResponses[i]);
    }
  }
  hide(state) {
    console.log('hi');
    if (state) {
      this.hideElement.children[0].innerText = 'Reveal';
      this.displayElement.style.display = 'none';
    } else {
      if (this.displayElement.children.length) {
        for (let i = this.displayElement.children.length; i >= 0; i--) {
            this.displayElement.append(this.displayElement.children[Math.random() * i | 0]);
        }
      }
      this.hideElement.children[0].innerText = 'Hide';
      this.displayElement.style.display = 'flex';
    }
  }
  clear() {
    while (this.displayElement.firstChild) {
      this.displayElement.removeChild(this.displayElement.firstChild);
    }
  }
}

const responsesDisplay = new ResponsesDisplay(document.getElementById('responses'), document.getElementById('hide'));

class PlayersDisplay extends Display {
  render(list) {
    for (const key in list) {
      const div = document.createElement('div');
      div.classList.add('player');
      const p = document.createElement('p');
      p.innerText = list[key].name + ' (' + list[key].score + ')';
      div.append(p);
      const buttonDiv = document.createElement('div');
      const add = document.createElement('button');
      add.innerText = 'Add';
      add.addEventListener('click', () => {
        list[key].score++;
        playersDatabase.set(list);
      });
      buttonDiv.append(add);
      const subtract = document.createElement('button');
      subtract.innerText = 'Subtract';
      subtract.addEventListener('click', () => {
        list[key].score--;
        playersDatabase.set(list);
      });
      buttonDiv.append(subtract);
      div.append(buttonDiv);
      if (list[key].highlight) {
        div.classList.add('clicked');
      }
      div.addEventListener('click', function(e) {
        if (e.target === this || e.target === this.children[0] || e.target === this.children[1]) {
          list[key].highlight = !list[key].highlight;
          playersDatabase.set(list);
        }
      });
      this.displayElement.insertBefore(div, document.getElementById('newPlayer'));
    }
  }
  clear() {
    while (this.displayElement.children.length > 1) {
      this.displayElement.removeChild(this.displayElement.firstChild);
    }
  }
}

const playersDisplay = new PlayersDisplay(document.getElementById('players'));



/* Render */

let firstTime = 1;
responsesDatabase.listen((list) => {
  if (firstTime) {
    firstTime = 0;
    responsesDisplay.clear(list);
  }
  responsesDisplay.render(list);
});
document.getElementById('responsesClear').addEventListener('click', () => {
  responsesDatabase.clear();
});
document.getElementById('hide').addEventListener('click', function() {
  hideDatabase.set(this.children[0].innerText === 'Hide');
});

responsesDisplay.hide(hideDatabase.get());
hideDatabase.listen((state) => {
  responsesDisplay.hide(state);
});

playersDatabase.listen((list) => {
  playersDisplay.clear();
  playersDisplay.render(list);
});
document.getElementById('playersClear').addEventListener('click', () => {
  playersDatabase.clear();
});



/* Submit */

document.getElementById('form').onsubmit = function(val) {
  responsesDatabase.push({value: val.target[0].value, highlight: 0});
  this.reset();
  return false;
};

const newPlayer = document.getElementById('newPlayer');
function addPlayer() {
  playersDatabase.push({name: newPlayer.value, highlight: 0, score: 0});
  newPlayer.value = '';
}
newPlayer.addEventListener('change', addPlayer);
newPlayer.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    addPlayer();
  }
});
