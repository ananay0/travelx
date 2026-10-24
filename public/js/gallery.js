/*=========================================
            GALLERY.JS
=========================================*/


/*=========================================
        GALLERY FILTER
=========================================*/


const filterButtons =
document.querySelectorAll(".filter-btn");


const galleryItems =
document.querySelectorAll(".gallery-item");



filterButtons.forEach(button=>{


    button.addEventListener("click",()=>{


        filterButtons.forEach(btn=>{

            btn.classList.remove("active");

        });


        button.classList.add("active");



        const filter =
        button.dataset.filter;



        galleryItems.forEach(item=>{


            if(filter==="all" || item.classList.contains(filter)){


                item.style.display="block";

                item.classList.add("show");

            }


            else{


                item.style.display="none";

                item.classList.remove("show");

            }


        });



    });


});




/*=========================================
            LIGHTBOX
=========================================*/


const lightbox =
document.querySelector(".lightbox");


const lightboxImage =
document.querySelector(".lightbox-img");


const closeLightbox =
document.querySelector(".close-lightbox");



const galleryImages =
document.querySelectorAll(".gallery-img");



galleryImages.forEach(image=>{


    image.addEventListener("click",()=>{


        lightboxImage.src =
        image.src;


        lightbox.classList.add("active");


    });


});



if(closeLightbox){


    closeLightbox.addEventListener("click",()=>{


        lightbox.classList.remove("active");


    });


}



if(lightbox){


    lightbox.addEventListener("click",(e)=>{


        if(e.target === lightbox){


            lightbox.classList.remove("active");


        }


    });


}




/*=========================================
        FAVOURITE GALLERY
=========================================*/


const favButtons =
document.querySelectorAll(".fav-gallery");



let favouriteImages =
JSON.parse(
localStorage.getItem("galleryFavourite")
) || [];





favButtons.forEach(button=>{


    const imageName =
    button.dataset.image;


    const icon =
    button.querySelector("i");



    if(favouriteImages.includes(imageName)){


        button.classList.add("active");


        icon.classList.remove("fa-regular");


        icon.classList.add("fa-solid");


    }



});





favButtons.forEach(button=>{


    button.addEventListener("click",(e)=>{


        e.stopPropagation();



        const imageName =
        button.dataset.image;



        const icon =
        button.querySelector("i");




        if(favouriteImages.includes(imageName)){



            favouriteImages =
            favouriteImages.filter(
                item=>item!==imageName
            );



            button.classList.remove("active");



            icon.classList.remove("fa-solid");

            icon.classList.add("fa-regular");



        }



        else{



            favouriteImages.push(imageName);



            button.classList.add("active");



            icon.classList.remove("fa-regular");

            icon.classList.add("fa-solid");



        }





        localStorage.setItem(

            "galleryFavourite",

            JSON.stringify(favouriteImages)

        );



    });


});



/*=========================================
        ESC KEY CLOSE LIGHTBOX
=========================================*/


document.addEventListener("keydown",(e)=>{


    if(e.key==="Escape" && lightbox){


        lightbox.classList.remove("active");


    }


});