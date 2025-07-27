document.addEventListener('DOMContentLoaded', () => {
    let isOpenMenu = false;

    const btnAbout = document.getElementById('btn_about');
    const btnHabilities = document.getElementById('btn_habilities');
    const btnProjects = document.getElementById('btn_projects');
    const btnExperiences = document.getElementById('btn_experiences');

    /**sections */
    const sectionAbout = document.getElementById('section_about');
    const sectionHabilities = document.getElementById('section_habilities');
    const sectionProjects = document.getElementById('section_projects');
    const sectionExperiences = document.getElementById('section_experiences');

    /*menu mobile */
    const btnMobileAbout = document.getElementById('btn_mobile_about');
    const btnMobileHabilities = document.getElementById('btn_mobile_habilities');
    const btnMobileProjects = document.getElementById('btn_mobile_projects');
    const btnMobileExperiences = document.getElementById('btn_mobile_experiences');
    const menuMobile = document.getElementById('menu_mobile');
    const menuMobileLinks = document.getElementById('menu_mobile_links');
    const btnMenuMobile = document.getElementById("menu_btn");

    /**events mobile */
    btnMenuMobile.addEventListener('click', () => {
        isOpenMenu = !isOpenMenu;

        btnMenuMobile.classList.toggle('active');
        menuMobileLinks.classList.toggle('active');
        btnMenuMobile.classList.toggle('is__menu__btn__open__menu__mobile');
        menuMobile.classList.toggle('is__open__menu__mobile');
        
        btnMobileAbout.addEventListener('click', () => {
            menuMobile.classList.remove('is__open__menu__mobile');
            menuMobileLinks.classList.remove('active');
            btnMenuMobile.classList.remove("active");
            btnMenuMobile.classList.remove('is__menu__btn__open__menu__mobile');
            sectionAbout.scrollIntoView({behavior: "smooth"});
        });

        btnMobileHabilities.addEventListener('click', () => {
            menuMobile.classList.remove('is__open__menu__mobile');
            menuMobileLinks.classList.remove('active');
            btnMenuMobile.classList.remove("active");
            btnMenuMobile.classList.remove('is__menu__btn__open__menu__mobile');
            sectionHabilities.scrollIntoView({behavior: "smooth"});
        });

        btnMobileProjects.addEventListener('click', () => {
            menuMobile.classList.remove('is__open__menu__mobile');
            menuMobileLinks.classList.remove('active');
            btnMenuMobile.classList.remove("active");
            btnMenuMobile.classList.remove('is__menu__btn__open__menu__mobile');
            sectionProjects.scrollIntoView({behavior: "smooth"});
        });

        btnMobileExperiences.addEventListener('click', () => {
            menuMobile.classList.remove('is__open__menu__mobile');
            menuMobileLinks.classList.remove('active');
            btnMenuMobile.classList.remove("active");
            btnMenuMobile.classList.remove('is__menu__btn__open__menu__mobile');
            sectionExperiences.scrollIntoView({behavior: "smooth"});
        });
    });

    btnAbout.addEventListener('click', () => {
        sectionAbout.scrollIntoView({behavior: "smooth"});
    });

    btnHabilities.addEventListener('click', () => {
        sectionHabilities.scrollIntoView({behavior: "smooth"});
    });

    btnProjects.addEventListener('click', () => {
        sectiosectionProjectsnAbout.scrollIntoView({behavior: "smooth"});
    });

    btnExperiences.addEventListener('click', () => {
        sectionExperiences.scrollIntoView({behavior: "smooth"});
    });
});