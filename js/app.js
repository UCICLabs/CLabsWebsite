/* global Vue */

var newsSwiper;
var app;
var scrollTimer;

function smoothScroll(target) {
    $("body,html").animate({
        scrollTop: target.offset().top
    }, 800);
}

jQuery(document).ready(function ($) {
    "use strict";

    var contentSection = $(".content-section");
    var navigation = $("nav");

    navigation.on("click", "a", function (event) {
        event.preventDefault();
        smoothScroll($(this.hash));
    });

    $(window).on("scroll", function () {
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(function () {
            updateNavigation();
        }, 100);
    });
    updateNavigation();

    function updateNavigation() {
        var viewTop = $(window).scrollTop();
        var windowHeight = $(window).height();

        contentSection.each(function () {
            var sectionName = $(this).attr("id");
            var navigationMatch = $('nav a[href="#' + sectionName + '"]');
            var sectionTop = $("#" + sectionName).offset().top;
            var sectionHeight = $("#" + sectionName).height();

            if ((sectionTop - viewTop <= windowHeight / 2) && (sectionTop + sectionHeight - viewTop >= windowHeight / 2)) {
                navigationMatch.addClass("active-section");
            } else {
                navigationMatch.removeClass("active-section");
            }
        });
    }

    initVue();
});

function initVue() {
    $.getJSON({
        url: "data/lab_web_data.json"
    }).done(function (res) {
        //var nowYear = new Date().getFullYear();
        var params = res.private;

        res.publicationCategories.forEach(function (item) {
            item.show = true;
            item.total = 0;
        });

        var allAuthors = [];
        res.publicationAuthors.forEach(function (item) {
            allAuthors.push({ name: item, show: true, total: 0 });
        });
        var testAllAuthor = new Set();

        res.publications.forEach(function (yearGroup, index, array) {
            if (!yearGroup.list.length) {
                array.splice(index, 1);
                return;
            }
            yearGroup.show = true;
            yearGroup.list.forEach(function (pub) {
                if (pub.file) {
                    if (!pub.file.startsWith("http")) {
                        pub.file = "pubs/" + pub.file
                    }
                }
                pub.authors.forEach(function (authorName, index, array) {
                    array[index] = { name: authorName, show: false };
                    allAuthors.forEach(function (authorInfo) {
                        if (authorInfo.name === authorName) {
                            authorInfo.total += 1;
                        }
                    });
                    testAllAuthor.add(authorName);
                });
                pub.title = pub.title.trim();
            });
            yearGroup.list.sort(function (a, b) {
                if (a.authors.length > 1 && b.authors.length > 1 && a.authors[0].name === b.authors[0].name) {
                    return a.authors[1].name.localeCompare(b.authors[1].name);
                }
                return a.authors[0].name.localeCompare(b.authors[0].name);
            });
        });
        console.log(JSON.stringify(allAuthors));
        console.log(testAllAuthor);

        var teamRows = [];
        res.team.forEach(function (person, index) {
            if (index % 3 === 0) {
                teamRows.push([]);
            }
            if (!person.photo) {
                person.photo = "test.png";
            }
            if (person.social) {
                person.social.forEach(function (so) {
                    switch (so.type) {
                        case "email":
                            so.class = "fa-envelope";
                            break;
                        case "twitter":
                            so.class = "fa-twitter";
                            break;
                        case "linkedin":
                            so.class = "fa-linkedin";
                            break;
                        case "web":
                            so.class = "fa-html5";
                            break;
                        case "facebook":
                            so.class = "fa-facebook";
                            break;
                        default:
                            break;
                    }
                });
            }
            teamRows[teamRows.length - 1].push(person);
        });
        var teamRows2 = [];
        res.team2.forEach(function (person, index) {
            if (index % 3 === 0) {
                teamRows2.push([]);
            }
            if (!person.photo) {
                person.photo = "test.png";
            }
            if (person.social) {
                person.social.forEach(function (so) {
                    switch (so.type) {
                        case "email":
                            so.class = "fa-envelope";
                            break;
                        case "twitter":
                            so.class = "fa-twitter";
                            break;
                        case "linkedin":
                            so.class = "fa-linkedin";
                            break;
                        case "web":
                            so.class = "fa-html5";
                            break;
                        case "facebook":
                            so.class = "fa-facebook";
                            break;
                        default:
                            break;
                    }
                });
            }
            teamRows2[teamRows2.length - 1].push(person);
        });

        var projects = [[], [], []];
        res.projects.forEach(function (project) {
            project.groups.forEach(function (groupId) {
                projects[groupId].push(project);
            });
        });

        var partnerRows = [];
        res.partners.forEach(function (p, index) {
            if (index % 5 === 0) {
                partnerRows.push([]);
            }
            partnerRows[partnerRows.length - 1].push(p);
        });
        var partnerRows2 = [];
        res.partners2.forEach(function (p, index) {
            if (index % 5 === 0) {
                partnerRows2.push([]);
            }
            partnerRows2[partnerRows2.length - 1].push(p);
        });

        Vue.component("my-simple-pub-item", {
            template: "#my-pub-comp-temp",
            props: ["paper", "showAllAuthors", "allCats", "showYear"],
            computed: {
                showThisPaper() {
                    if (!this.allCats) {
                        return true;
                    }
                    if (this.allCats[this.allCats.length - 1].show) {//suggested readings
                        if (this.paper.sug) {
                            return true;
                        }
                    }
                    var showThisCat = false;
                    for (var i = 0; i < this.allCats.length; i++) {
                        if (this.allCats[i].id === this.paper.cat && this.allCats[i].show) {
                            showThisCat = true;
                            break;
                        }
                    }

                    if (this.showAllAuthors) {
                        return showThisCat;
                    }

                    var haveOneAuthorToShow = false;
                    for (var i = 0; i < this.paper.authors.length; i++) {
                        if (this.paper.authors[i].show) {
                            haveOneAuthorToShow = true;
                            break;
                        }
                    }
                    return haveOneAuthorToShow && showThisCat;
                },
                authorText() {
                    let index = this.paper.authors.length - 1;
                    let text = "";
                    if (index > -1) {
                        text += this.paper.authors[index].name;
                        if (this.paper.authors.length > 1) {
                            text = " & " + text;
                        }
                        index -= 1;
                    }
                    while (index >= 0) {
                        text = this.paper.authors[index].name + ", " + text;
                        index -= 1;
                    }
                    return text;
                }
            }
        });

        $.ajax("data/all.html").done(function (data) {
            var html = $.parseHTML(data);
            $("#all_projects").append(html);

            app = new Vue({
                el: "#app",
                data: {
                    researchTabs: [true, false, false],
                    showProjectDetails: "",
                    publications: res.publications,
                    publicationCategories: res.publicationCategories,
                    publicationAuthors: allAuthors,
                    clickCatFirstTime: true,
                    clickAuthorFirstTime: true,
                    showAllAuthors: true,
                    teamRows: teamRows,
                    teamRows2: teamRows2,
                    messageSent: false,
                    contactButton: "Send Message Now",
                    contactName: "",
                    contactEmail: "",
                    contactSubject: "",
                    contactMessage: "",
                    partners: partnerRows,
                    partners2: partnerRows2,
                    news: res.news,
                    projects: projects
                },
                created() {
                },
                mounted() {
                    console.log("vue mounted!");
                },
                methods: {
                    clickResearchTab(id) {
                        this.showProjectDetails = "";

                        for (var i = 0; i < this.researchTabs.length; i++) {
                            if (id === i) {
                                Vue.set(this.researchTabs, i, true);
                            } else {
                                Vue.set(this.researchTabs, i, false);
                            }
                        }
                    },
                    nextNews() {
                        if (!newsSwiper) {
                            return;
                        }
                        newsSwiper.slideNext();
                        var videos = document.getElementsByClassName("news-videos");
                        for (var i = 0; i < videos.length; i++) {
                            videos[i].pause();
                        }
                    },
                    cleanResearchTabs() {
                        for (var i = 0; i < this.researchTabs.length; i++) {
                            this.researchTabs[i] = false;
                        }
                    },
                    readProjectDetials(id) {
                        this.showProjectDetails = id;

                        this.cleanResearchTabs();
                        Vue.set(this.researchTabs, 0, false);
                        smoothScroll($("#research"));
                    },
                    openWebsite(url) {
                        window.open(url, "_blank");
                    },
                    getPaper(year, titlePart) {
                        for (var i = 0; i < this.publications.length; i++) {
                            if (this.publications[i].year === year) {
                                for (var j = 0; j < this.publications[i].list.length; j++) {
                                    if (this.publications[i].list[j].title.endsWith(titlePart)) {
                                        if (this.publications[i].list[j].title !== titlePart) {//prevent searching the whole thing
                                            return this.publications[i].list[j];
                                        }
                                    }
                                }
                            }
                        }
                    },
                    showPubYear(year) {
                        for (var i = 0; i < this.publications.length; i++) {
                            if (this.publications[i].year === year) {
                                this.publications[i].show = !this.publications[i].show;
                                return;
                            }
                        }
                    },
                    sendMessage() {
                        if (!$("#contact-form")[0].checkValidity()) {
                            //go validate again to trigger native html error message
                            $("#form-submit").click();
                            return;
                        }
                        var message = "from: " + this.contactName + ", " + this.contactEmail + "\n";
                        message += this.contactSubject + "\n";
                        message += this.contactMessage;

                        $.ajax("https://hooks" + ".slack.com/services/" + params[1] + "/" + params[0] + "/" + params[2] + params[3], {
                            method: "POST",
                            dataType: "json",
                            processData: false,
                            data: JSON.stringify({ text: message })
                        });
                        this.messageSent = true;
                        this.contactButton = "Message Sent!";
                    },
                    clickPubCat(cat) {
                        if (this.clickCatFirstTime) {
                            this.publicationCategories.forEach(function (item) {
                                if (item.id === cat.id) {
                                    Vue.set(item, "show", true);
                                } else {
                                    Vue.set(item, "show", false);
                                }
                            });
                            this.clickCatFirstTime = false;
                            return;
                        }
                        cat.show = !cat.show;
                    },
                    clickPubAuthor(author) {
                        var self = this;
                        if (self.clickAuthorFirstTime) {
                            self.publicationAuthors.forEach(function (item) {
                                if (item.name === author.name) {
                                    Vue.set(item, "show", true);
                                } else {
                                    Vue.set(item, "show", false);
                                }
                            });
                            self.clickAuthorFirstTime = false;
                            self.showAllAuthors = false;
                            self.publications.forEach(function (group) {
                                group.list.forEach(function (paper) {
                                    paper.authors.forEach(function (paperAuthor) {
                                        if (paperAuthor.name === author.name) {
                                            paperAuthor.show = true;
                                        }
                                    });
                                });
                            });
                            return;
                        }

                        author.show = !author.show;
                        if (!author.show) {
                            self.showAllAuthors = false;
                        } else {
                            self.showAllAuthors = true;
                            self.publicationAuthors.forEach(function (author) {
                                if (!author.show) {
                                    self.showAllAuthors = false;
                                }
                            });
                        }

                        self.publications.forEach(function (group) {
                            group.list.forEach(function (paper) {
                                paper.authors.forEach(function (paperAuthor) {
                                    if (paperAuthor.name === author.name) {
                                        paperAuthor.show = author.show;
                                    }
                                });
                            });
                        });
                    },
                    showAllYearPapers(show) {
                        for (var i = 0; i < this.publications.length; i++) {
                            this.publications[i].show = show;
                        }
                    }
                }
            });
            console.log("vue ready!");

            newsSwiper = new Swiper(".swiper-container", {
                spaceBetween: 150,
                pagination: {
                    el: ".swiper-pagination",
                    dynamicBullets: true,
                    clickable: true
                },
                preventClicksPropagation: false,
                preventClicks: false,
                noSwiping: true
            });
            console.log("news ready!");

            initJsControls();
            console.log("js controls ready!");
        });
    });
}

function initJsControls() {
    $("#goTopProject1").click(function () {
        smoothScroll($("#research"));
        app.readProjectDetials("rcm");
    });

    $("#goTopProject2").click(function () {
        smoothScroll($("#research"));
        app.readProjectDetials("biosim");
    });

    $("#link_top").on("click", function (e) {
        e.preventDefault();
        $("html, body").animate({ scrollTop: "0px" }, 500, "linear");
    });

    $(".Modern-Slider").slick({
        autoplay: true,
        speed: 4000,
        slidesToShow: 1,
        slidesToScroll: 1,
        pauseOnHover: false,
        dots: true,
        fade: true,
        pauseOnDotsHover: true,
        draggable: false,
        prevArrow: '<button class="PrevArrow"></button>',
        nextArrow: '<button class="NextArrow"></button>'
    });

    $(".my-book-slide").slick({
        dots: false,
        infinite: false,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 2,
        variableWidth: true,
        draggable: false,
        swipe: false,
        centerPadding: "0px",
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
}

