'use strict';

(async function () {
  const filmsData = await getData('https://swapi.dev/api/films/');
  const starshipsAddresses = await getData(
    'https://swapi.dev/api/films/',
    'starships'
  );
  const starshipsData = await getData(starshipsAddresses);

  renderStarships(starshipsData);
  renderFilms(filmsData);

  const $starshipsButton = document.querySelector('.starships-button');
  const $starshipsContainer = document.querySelector('.starships');
  const [...$allStarships] = $starshipsContainer.children;
  const $filmsContainer = document.querySelector('.films');
  const [...$allFilms] = $filmsContainer.children;
  const $activeItem = document.querySelectorAll('.active');

  $starshipsButton.addEventListener('click', () =>
    $starshipsContainer.classList.toggle('hidden')
  );

  $allStarships.forEach($starship => {
    const [...starshipClasses] = $starship.classList;
    $starship.addEventListener('click', () => {
      $allFilms.forEach($film => {
        const filmClasses = [...$film.classList];
        $filmsContainer.classList.remove('hidden');
        $film.classList.add('hidden');
        filmClasses.some(filmClass => {
          if (starshipClasses.includes(filmClass)) {
            $film.classList.toggle('hidden');
            $starshipsContainer.classList.add('overlay');
          }
        });
      });
    });
  });

  $activeItem.forEach($item =>
    $item.addEventListener('click', () => {
      $filmsContainer.classList.add('hidden');
      $starshipsContainer.classList.toggle('overlay');
    })
  );
})();

async function getJSON(url, errorMessage = 'Something went wrong') {
  return await fetch(url).then(function (response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`${errorMessage} (${response.status})`);
    }
  });
}

async function getData(addresses, data = null) {
  try {
    if (Array.isArray(addresses)) {
      const [...urls] = new Set(addresses.flatMap(address => address));
      return await Promise.all(urls.map(url => getJSON(url)));
    } else {
      const json = await getJSON(addresses);
      return json.results.map(el => el[data] || el);
    }
  } catch (error) {
    console.error(error);
  }
}

function setClass(element, data) {
  const stringToAdd = 'film-';
  if (Array.isArray(element[data])) {
    return element[data]
      .reduce(
        (classes, el) => (classes += stringToAdd + el.slice(-2, -1) + ' '),
        ''
      )
      .trimRight();
  } else {
    return element[data] <= 3
      ? `${stringToAdd}${element[data] + 3}`
      : `${stringToAdd}${element[data] - 3}`;
  }
}

function renderFilms(filmsData) {
  filmsData
    .sort((a, b) => a.episode_id - b.episode_id)
    .map(film => {
      const html = `
      <div class="film ${setClass(film, 'episode_id')} active hidden">
        <h1 class="film-title">${film.title}</h1>
          <p>
            <span class="film-subtitle">Release Date:</span> <span class="film-text">${
              film.release_date
            }</span>
          <br>
            <span class="film-subtitle">Producer:</span> <span class="film-text">${
              film.producer
            }</span>
          <br>
            <span class="film-subtitle">Director:</span> <span class="film-text">${
              film.director
            }</span>
          </p>
      </div>`;
      document.querySelector('.films').insertAdjacentHTML('beforeend', html);
    });
}

function renderStarships(starshipsData) {
  starshipsData
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(starship => {
      const html = `
      <div class="starship ${setClass(starship, 'films')}">
        <h1 class="starship-title">${starship.name}</h1>
          <p>
            <span class="starship-subtitle">Model:</span> <span class="starship-text">${
              starship.model
            }</span>
          <br>
            <span class="starship-subtitle">Class:</span> <span class="starship-text">${
              starship.starship_class
            }</span>
          <br>
            <span class="starship-subtitle">Manufacturer:</span> <span class="starship-text">${
              starship.manufacturer
            }</span>
          </p>
        </div>`;
      document
        .querySelector('.starships')
        .insertAdjacentHTML('beforeend', html);
    });
}
