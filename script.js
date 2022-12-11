/* Firebase */

firebase.initializeApp({
  apiKey: 'AIzaSyBqUCCFOsGpHaYAMk7Lgpp1PeWC34lCS4s',
  authDomain: 'tylergordonhill-c8339.firebaseapp.com',
  databaseURL: 'https://tylergordonhill-c8339-default-rtdb.firebaseio.com',
  projectId: 'tylergordonhill-c8339',
  storageBucket: 'tylergordonhill-c8339.appspot.com',
  messagingSenderId: '10243950475',
  appId: '1:10243950475:web:ff9abba5961c2fc49c918e'
});

firebase.appCheck().activate('6LfVw0sjAAAAAN0-OJ7XqY-MmsV2dFz_uOAP2QET', true);

const firebaseRef = firebase.database().ref();



/* Database */

class Database {
  constructor(ref) {
    this.ref = ref;
  }
  parse(response) {
    if (response.exists()) {
      return response.val();
    } else {
      return '';
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
  set(data, path = '/') {
    return this.ref.child(path).set(data);
  }
  clear(path = '/') {
    return this.ref.child(path).remove();
  }
  push(data) {
    return this.ref.push().set(data);
  }
  listen(callback) {
    this.ref.on('value', (response) => {
      callback(this.parse(response));
    });
  }
}

const responsesDatabase = new Database(firebaseRef.child('/response-display/responses'));
const hideDatabase = new Database(firebaseRef.child('/response-display/hide'));
const playersDatabase = new Database(firebaseRef.child('/response-display/players'));



/* Display */

class Display {
  constructor(displayElement, hideElement, extraHides, elementFunctions) {
    this.displayElement = displayElement;
    this.hideElement = hideElement;
    this.extraHides = extraHides;
    this.elementFunctions = elementFunctions;
  }
  render() {}
  clear() {
    while (this.displayElement.firstChild) {
      this.displayElement.removeChild(this.displayElement.firstChild);
    }
  }
  shuffle() {}
  hide(state) {
    if (state) {
      this.hideElement.innerText = 'Reveal';
      this.displayElement.style.display = 'none';
      this.extraHides.extraHide();
    } else {
      this.shuffle();
      this.hideElement.innerText = 'Hide';
      this.displayElement.style.display = 'flex';
      this.extraHides.extraShow();
    }
  }
}



/* Responses Display */

class ResponsesDisplay extends Display {
  constructor(displayElement, hideElement, countElement, extraHides, elementFunctions) {
    super(displayElement, hideElement, extraHides, elementFunctions);
    this.countElement = countElement;
  }
  render(list) {
    this.countElement.innerText = ' (' + Object.keys(list).length + ')';
    const responses = this.displayElement.getElementsByClassName('response');
    for (let i = 0; i < responses.length; i++) {
      responses[i].classList.add('old');
    }
    for (const key in list) {
      const p = document.createElement('p');
      p.classList.add('response');
      p.tabIndex = 0;
      p.innerText = list[key].value;
      if (list[key].highlight) {
        p.classList.add('clicked');
      }
      p.addEventListener('click', () => {
        this.elementFunctions.highlight(!list[key].highlight, key);
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
  shuffle() {
    if (this.displayElement.children.length) {
      for (let i = this.displayElement.children.length; i >= 0; i--) {
          this.displayElement.append(this.displayElement.children[Math.random() * i | 0]);
      }
    }
  }
}

const responsesDisplay = new ResponsesDisplay(document.getElementById('responseDisplay'), document.getElementById('responsesHide').children[0], document.getElementById('responsesHide').children[1], {
  'extraHide': () => {
    document.getElementById('responsesClear').style.display = 'none';
  }, 
  'extraShow': () => {
  document.getElementById('responsesClear').style.display = 'flex';
  }
}, {
  'highlight': (set, key) => {
    responsesDatabase.set(set, '/' + key + '/highlight');
  }
});



/* Players Display */

class PlayersDisplay extends Display {
  render(list) {
    for (const key in list) {
      const div = document.createElement('div');
      div.classList.add('player');
      div.tabIndex = 0;
      const p = document.createElement('p');
      p.innerText = list[key].name + ' (' + list[key].score + ')';
      div.append(p);
      const buttonDiv = document.createElement('div');
      const remove = document.createElement('button');
      remove.innerText = 'Remove';
      remove.addEventListener('click', () => {
        this.elementFunctions.remove(key);
      });
      buttonDiv.append(remove);
      const subtract = document.createElement('button');
      subtract.innerText = 'Subtract';
      subtract.addEventListener('click', () => {
        this.elementFunctions.set(list[key].score - 1, key);
      });
      buttonDiv.append(subtract);
      const add = document.createElement('button');
      add.innerText = 'Add';
      add.addEventListener('click', () => {
        this.elementFunctions.set(list[key].score + 1, key);
      });
      buttonDiv.append(add);
      [remove, subtract, add].forEach(item => {
        item.addEventListener('mouseover', () => {
          div.classList.add('buttonHover');
        });
        item.addEventListener('mouseout', () => {
          div.classList.remove('buttonHover');
        });
      });      
      div.append(buttonDiv);
      if (list[key].highlight) {
        div.classList.add('clicked');
      }
      div.addEventListener('click', function(e) {
        if (e.target === this || e.target === this.children[0] || e.target === this.children[1]) {
          this.elementFunctions.highlight(!list[key].highlight, key);
        }
      });
      this.displayElement.append(div);
    }
  }
}

const playersDisplay = new PlayersDisplay(document.getElementById('playerDisplay'), document.getElementById('playersHide'), {
  'extraHide': () => {
    document.getElementById('playersClear').style.display = 'none';
    document.getElementById('playerInput').style.display = 'none';
  }, 
  'extraShow': () => {
  document.getElementById('playersClear').style.display = 'block';
  document.getElementById('playerInput').style.display = 'flex';
  }
}, {
  'remove': (key) => {
    playersDatabase.clear('/' + key);
  },
  'set': (set, key) => {
    playersDatabase.set(set, '/' + key + '/score');
  },
  'highlight': (set, key) => {
    responsesDatabase.set(set, '/' + key + '/highlight');
  }
});



/* Listen and render */

//Responses listen
let firstTime = 1;
responsesDatabase.listen((list) => {
  if (firstTime) {
    firstTime = 0;
    responsesDisplay.clear();
  }
  responsesDisplay.render(list);
});

//Responses clear
document.getElementById('responsesClear').addEventListener('click', () => {
  responsesDatabase.clear();
});

//Responses hide
document.getElementById('responsesHide').addEventListener('click', function() {
  hideDatabase.set(this.children[0].innerText === 'Hide');
});
hideDatabase.listen((state) => {
  responsesDisplay.hide(state);
});

//Players listen
playersDatabase.listen((list) => {
  playersDisplay.clear();
  playersDisplay.render(list);
});

//Players clear
document.getElementById('playersClear').addEventListener('click', () => {
  playersDatabase.clear();
});

//Player hide
document.getElementById('playersHide').addEventListener('click', function() {
  playersDisplay.hide(this.innerText === 'Hide');
});



/* Submit */

document.getElementById('responseInput').onsubmit = function(val) {
  responsesDatabase.push({value: val.target[0].value, highlight: 0});
  this.reset();
  return false;
};

document.getElementById('playerInput').onsubmit = function(val) {
  playersDatabase.push({name: newPlayer.value, highlight: 0, score: 0});
  this.reset();
  return false;
};



/* Enter and Space */

document.body.addEventListener('keydown', function(e) { //enable enter while tabbing over spans
  if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && document.activeElement !== null && (document.activeElement.classList.contains('response') || document.activeElement.classList.contains('player'))) {
    document.activeElement.click();
  }
});
