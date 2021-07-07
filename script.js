const mealsEl = document.getElementById("meals");

const favouriteContainer = document.getElementById("fav-meals");

const mealPopup = document.getElementById("meal-popup");

const mealInfoEl = document.getElementById("meal-info");

const popupClose = document.getElementById("close-popup");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomMeal();
fetchFavMeals();
//Función que obtiene el alimento aleatorio
async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );

  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  addMeal(randomMeal, true);
}
//Función que obtiene alimento por id.
async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}
//Función que obtiene el alimento por busqueda.
async function getMealsBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}
//Función que añade alimento al cuerpo principal
function addMeal(mealData, random = false) {
  console.log(mealData);
  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = `                        
                <div class="meal-header">
                        ${
                          random
                            ? `
                        <span class="random">Random Recipe
                        </span>`
                            : ""
                        }
                        <img 
                                src="${mealData.strMealThumb}"
                                alt="${mealData.strMeal}">
                </div>
                <div class="meal-body">
                        <h4>${mealData.strMeal}</h4>
                        <button class="fav-btn">
                                <i class="fas fa-heart"></i>
                        </button>
                </div>
        `;

  const btn = meal.querySelector(".meal-body .fav-btn");
  //Click que ejecuta y guarda/elimina id del alimento favorito.
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealLS(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}
//Función que añade al almacenamiento local el id
function addMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}
//Función que remueve el id del almacenamiento local
function removeMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}
//Función que obtiene los id´s de los alimentos guardados/favoritos.
function getMealsLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}
//Función que hace contener los id de los alimentos favoritos
async function fetchFavMeals() {
  //Clean the container
  favouriteContainer.innerHTML = "";

  const mealIds = getMealsLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];

    meal = await getMealById(mealId);

    addMealFav(meal);
  }
}
//Función que agrega el alimento favorito en el documento
function addMealFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
                <img 
                src="${mealData.strMealThumb}" 
                alt="${mealData.strMeal}">
                <span>${mealData.strMeal}</span>
                <button class="clear">
                        <i class="fas fa-window-close"></i>
                </button>
        `;

  const btn = favMeal.querySelector(".clear");

  btn.addEventListener("click", () => {
    removeMealLS(mealData.idMeal);

    fetchFavMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favouriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
  //Clean it up
  mealInfoEl.innerHTML = "";
  //update the Meal info
  const mealEl = document.createElement("div");

  const ingredients = [];
  //get ingredients and measures
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]}-${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img 
        src="${mealData.strMealThumb}" 
        alt="${mealData.strMeal}">
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients: </h3>
        <ul>
                ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
  `;

  mealInfoEl.appendChild(mealEl);

  //show the popup
  mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
  //Clean Container
  mealsEl.innerHTML = "";

  const search = searchTerm.value;

  const meals = await getMealsBySearch(search);

  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});

popupClose.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});

if ("servicWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then((reg) => console.log("Registro de SW exitoso", reg))
    .catch((err) => console.warn("Error al tratar de 	registrar el sw", err));
}
