/*=========================================
            TRAVELX FILTER.JS
=========================================*/


const searchInput = 
document.getElementById("searchInput");


const filterButtons = 
document.querySelectorAll(".filter-btn");


const cards = 
document.querySelectorAll(".package-card, .destination-card");



/*=========================================
            SEARCH FILTER
=========================================*/


if(searchInput){


searchInput.addEventListener("input",()=>{


    const searchValue =

    searchInput.value.toLowerCase();



    cards.forEach(card=>{


        const text =

        card.innerText.toLowerCase();



        if(text.includes(searchValue)){


            card.style.display="block";


        }


        else{


            card.style.display="none";


        }



    });



});


}







/*=========================================
            CATEGORY FILTER
=========================================*/


filterButtons.forEach(button=>{


button.addEventListener("click",()=>{


    const category =

    button.getAttribute("data-filter");



    filterButtons.forEach(btn=>{


        btn.classList.remove("active");


    });



    button.classList.add("active");





    cards.forEach(card=>{


        const cardCategory =

        card.getAttribute("data-category");



        if(category==="all" || 
        cardCategory===category){


            card.style.display="block";


        }


        else{


            card.style.display="none";


        }



    });



});


});







/*=========================================
            PRICE FILTER
=========================================*/


const priceFilter =

document.getElementById("priceFilter");



if(priceFilter){



priceFilter.addEventListener("change",()=>{


const selectedPrice =

priceFilter.value;




cards.forEach(card=>{


const price =

parseInt(

card.getAttribute("data-price")

);





if(selectedPrice==="all"){


card.style.display="block";


}



else if(selectedPrice==="low" && price<=10000){


card.style.display="block";


}



else if(selectedPrice==="medium" && price>10000 && price<=30000){


card.style.display="block";


}



else if(selectedPrice==="high" && price>30000){


card.style.display="block";


}



else{


card.style.display="none";


}



});



});


}







/*=========================================
        NO RESULT MESSAGE
=========================================*/


function checkNoResult(){


let visibleCards = 0;



cards.forEach(card=>{


if(card.style.display!=="none"){


visibleCards++;


}


});



const noResult =

document.querySelector(".no-result");



if(noResult){


if(visibleCards===0){


noResult.style.display="block";


}


else{


noResult.style.display="none";


}



}


}