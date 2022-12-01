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
      return Object.values(response.val());
    } else {
      return [];
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

const database = new Database(firebase.database().ref());



/* Display */

class Display {
  constructor(element) {
    this.element = element;
  }
  render(list) {
    for (const item of list) {
      const p = document.createElement('p');
      p.innerText = item;
      p.addEventListener('click', function() {
        this.classList.toggle('clicked');
      });
      this.element.append(p);
    }
  }
  clear() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
  }
}

const display = new Display(document.getElementById('display'));



/* Render */

database.listen((list) => {
  display.clear();
  display.render(list);
});



/* Submit */

document.getElementById('form').onsubmit = function(val) {
  database.push(val.srcElement[0].value);
  this.reset();
  return false;
};



/* Options */

document.getElementById('clear').addEventListener('click', () => {
  database.clear();
});

document.getElementById('hide').addEventListener('click', function() {
  const displayElement = document.getElementById('display');
  if (this.classList.contains('hidden')) {
    this.classList.remove('hidden');
    displayElement.style.display = 'flex';
  } else {
    this.classList.add('hidden');
    displayElement.style.display = 'none';
  }
});
