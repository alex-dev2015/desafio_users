let globalUsers = [];

let numberFormat = null;
let inputName = null;

let listUsers = null;
let listStatistics = null;

window.addEventListener('load', () => {
  inputName = document.querySelector('#input_search');

  inputName.value = '';
  inputName.focus();

  listUsers = document.querySelector('#list_users');
  listStatistics = document.querySelector('#list_statistics');

  numberFormat = Intl.NumberFormat('pt-BR');

  preventFormSubmit();
  activeInput();

  animationSpinner();
  render(globalUsers);
});

function preventFormSubmit() {
  function handleFormSubmit(event) {
    event.preventDefault();
  }

  var form = document.querySelector('form');
  form.addEventListener('submit', handleFormSubmit);
}

function activeInput() {
  button = document.querySelector('#button_search');
  if (inputName.value.toLowerCase() === '') {
    button.classList.add('disabled');
    render([]);
  }

  async function handleTyping(event) {
    const countText = inputName.value.length;

    if (countText >= 1) {
      button.classList.remove('disabled');
    } else {
      button.classList.add('disabled');
      render([]);
    }

    if (event.key === 'Enter' && event.target.value.trim() !== '') {
      if (countText >= 1) {
        animationSpinner();
        await fetchUsers(inputName.value);
      }
    }
  }

  inputName.addEventListener('keyup', handleTyping);
}

async function fetchUsers(users) {
  const response = await fetch('http://localhost:3001/users');
  const json = await response.json();

  globalUsers = json.map(({ name, picture, dob, gender }) => {
    return {
      name: `${name.first} ${name.last}`,
      userPicture: picture.medium,
      userAge: dob.age,
      userGender: gender,
    };
  });

  globalUsers.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  const filtered = globalUsers.filter((usefilter) => {
    return usefilter.name.includes(users);
  });

  render(filtered);
}

function animationSpinner() {
  let count = 0;

  showSpinner();

  const interval = setInterval(() => {
    ++count;

    if (count === 1) {
      this.clearInterval(interval);
      return hideSpinner();
    }
  }, 1000);
}

function hideSpinner() {
  document.querySelector('#spinner').classList.add('hide');
}

function showSpinner() {
  document.querySelector('#spinner').classList.remove('hide');
}

function render(users) {
  renderSearchUsers(users);
  renderSearchStatistcs(users);
}

function renderSearchUsers(users) {
  listUsers.innerHTML = '';

  let usersElement = document.createElement('div');
  let resumeItems = document.querySelector('#filter_user');

  if (users.length === 0) {
    resumeItems.textContent = 'Nenhum Usuário Filtrado';
  } else {
    resumeItems.textContent = `${users.length} Usuários Encontrados`;
  }

  users.forEach((user) => {
    let userDiv = document.createElement('div');
    userDiv.classList = 'user';

    const image = createPhotoThumb(user.userPicture, user.name);
    const info = createUserInfo(user.name, user.userAge);

    userDiv.appendChild(image);
    userDiv.appendChild(info);

    usersElement.appendChild(userDiv);
  });

  listUsers.appendChild(usersElement);
}

function renderSearchStatistcs(users) {
  listStatistics.innerHTML = '';

  let titleStatistics = document.querySelector('#statistics');

  let statsElement = document.createElement('div');

  if (users.length === 0) {
    let searchText = document.createElement('div');
    titleStatistics.textContent = 'Nada a ser exibido';
    statsElement.appendChild(searchText);
  } else {
    // sum of female users
    titleStatistics.textContent = 'Estatísticas';
    let statsFemaleUsers = document.createElement('div');
    const femaleUsers = users.reduce(
      (acc, cur) => (cur.userGender === 'female' ? ++acc : acc),
      0
    );
    statsFemaleUsers.textContent = `Usuários do sexo Feminino: ${femaleUsers}`;
    statsElement.appendChild(statsFemaleUsers);

    // sum of male users
    let statsMaleUsers = document.createElement('div');
    const maleUsers = users.reduce(
      (acc, cur) => (cur.userGender === 'male' ? ++acc : acc),
      0
    );
    statsMaleUsers.textContent = `Usuários do sexo Masculino: ${maleUsers}`;
    statsElement.appendChild(statsMaleUsers);

    // sum of all users' ages
    let statsAgeSum = document.createElement('div');
    const usersAgeSum = users.reduce((acc, cur) => acc + cur.userAge, 0);
    statsAgeSum.textContent = `Soma das idades: ${usersAgeSum}`;
    statsElement.appendChild(statsAgeSum);

    // average age for all users
    let statsAgeAvg = document.createElement('div');
    const usersAgeAvg = usersAgeSum / users.length;
    statsAgeAvg.textContent = `Média das idades: ${formatNumber(
      usersAgeAvg.toFixed(2)
    )}`;
    statsElement.appendChild(statsAgeAvg);
  }

  listStatistics.appendChild(statsElement);
}

function createPhotoThumb(src, alt) {
  const photoDiv = document.createElement('div');
  const photoImg = document.createElement('img');

  photoImg.src = src;
  photoImg.alt = alt;
  photoDiv.appendChild(photoImg);

  return photoDiv;
}

function createUserInfo(name, age) {
  const infoDiv = document.createElement('div');
  const infoSpan = document.createElement('span');

  infoSpan.textContent = `${name}, ${age} years`;
  infoDiv.appendChild(infoSpan);

  return infoDiv;
}

function formatNumber(number) {
  return numberFormat.format(number);
}
