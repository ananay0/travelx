/*=========================================
            PACKAGE.JS
=========================================*/


const packageSearch =
document.getElementById("packageSearch");


const packageCategory =
document.getElementById("packageCategory");


const packageCards =
document.querySelectorAll(".package-card");


/*=========================================
        NO RESULT MESSAGE
=========================================*/


const packageGrid =
document.querySelector(".package-grid");


const noPackage =
document.createElement("h2");


noPackage.textContent =
"No package found.";


noPackage.style.textAlign =
"center";


noPackage.style.width =
"100%";


noPackage.style.marginTop =
"40px";


noPackage.style.display =
"none";


if(packageGrid){

    packageGrid.appendChild(noPackage);

}



/*=========================================
        FILTER FUNCTION
=========================================*/


function filterPackages(){


    let searchValue =
    packageSearch.value.toLowerCase().trim();


    let categoryValue =
    packageCategory.value;


    let visibleCount = 0;



    packageCards.forEach(card=>{


        let title =
        card.querySelector("h3")
        .textContent
        .toLowerCase();


        let category =
        card.dataset.category;



        let searchMatch =
        title.includes(searchValue);



        let categoryMatch =
        categoryValue==="all" ||
        category===categoryValue;



        if(searchMatch && categoryMatch){


            card.style.display="block";


            card.classList.remove("hide");


            card.classList.add("show");


            visibleCount++;


        }

        else{


            card.style.display="none";


            card.classList.remove("show");


            card.classList.add("hide");


        }


    });



    if(visibleCount===0){

        noPackage.style.display="block";

    }

    else{

        noPackage.style.display="none";

    }


}



/*=========================================
        SEARCH EVENT
=========================================*/


if(packageSearch){


    packageSearch.addEventListener(
        "keyup",
        filterPackages
    );


}



/*=========================================
        CATEGORY EVENT
=========================================*/


if(packageCategory){


    packageCategory.addEventListener(
        "change",
        filterPackages
    );


}



/*=========================================
        ENTER KEY SEARCH
=========================================*/


if(packageSearch){


    packageSearch.addEventListener(
        "keypress",
        function(e){


            if(e.key==="Enter"){


                filterPackages();


            }


        }
    );


}