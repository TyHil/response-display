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

const responses = new Database(firebase.database().ref('/responses'));
const hide = new Database(firebase.database().ref('/hide'));



/* Display */

class Display {
  constructor(displayElement, hideElement) {
    this.displayElement = displayElement;
    this.hideElement = hideElement;
  }
  render(list) {
    this.hideElement.children[1].innerText = ' (' + Object.keys(list).length + ')';
    for (const key in list) {
      const p = document.createElement('p');
      p.innerText = list[key].value;
      if (list[key].highlight) {
        p.classList.add('clicked');
      }
      p.addEventListener('click', () => {
        list[key].highlight = !list[key].highlight;
        responses.set(list);
      });
      this.displayElement.append(p);
    }
  }
  clear() {
    while (this.displayElement.firstChild) {
      this.displayElement.removeChild(this.displayElement.firstChild);
    }
  }
  hide(state) {
    if (state) {
      this.hideElement.children[0].innerText = 'Reveal';
      this.displayElement.style.display = 'none';
    } else {
      this.hideElement.children[0].innerText = 'Hide';
      this.displayElement.style.display = 'flex';
    }
  }
}

const display = new Display(document.getElementById('display'), document.getElementById('hide'));



/* Render */

display.hide(hide.get());
hide.listen((state) => {
  display.hide(state);
});

responses.listen((list) => {
  display.clear();
  display.render(list);
});



/* Submit */

document.getElementById('form').onsubmit = function(val) {
  responses.push({value: val.target[0].value, highlight: 0});
  this.reset();
  return false;
};



/* Options */

document.getElementById('clear').addEventListener('click', () => {
  responses.clear();
});

document.getElementById('hide').addEventListener('click', function() {
  hide.set(this.children[0].innerText === 'Hide');
});
