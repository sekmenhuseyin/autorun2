var utils = {
    encodeHTML: function (str) {
        if (typeof str == "undefined" || str == null) {
            str = "";
        }

        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\\/g, '&#92;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\n/g, '<br>');
    },

    addPlaceHolder: function ($input, value) {
        $input.val(value);

        $input.on("focus", function () {
            if ($input.val().trim() === value) {
                $input.val("");
            }
        });

        $input.on("blur", function () {
            if ($input.val().trim() === "") {
                $input.val(value);
            }
        });
    },

    parseDate: function (str) {
        var array = str.split(" "),
            date = array[0].split("."),
            time = array[1].split(":");
        return new Date(date[2], date[1] - 1, date[0], time[0], time[1], time[2]);
    },

    nl2br: function (str) {
        return str.replace(/\n/g, '<br>');
    },

    br2nl: function (str) {
        return str.replace(/<.?br.?>/g, '\n');
    },

    validateForm: function ($form) {

        var hasError = false;
        $form.find("input, textarea").each(function (i, elem) {
            var $elem = $(elem),
                value = $elem.val().trim();

            if (value === "" || ($elem.attr("type") === "email" && value.lastIndexOf("@") === -1)) {
                $elem.addClass("invalid");
                hasError = true;
            } else {
                $elem.removeClass("invalid");
            }
        });
        return !hasError;
    },

    loadImg: function (urlArr) {
        var i = 0,
            len = urlArr.length;

        for (i = 0; i < len; i++) {
            var img = new Image();
            img.src = urlArr[i];
        }
    }

};

function Bookcase($container, userData, data, cateData, classData, departmentData) {

    this.container = $container;
    this.originalData = data;
    this.userData = userData;
    this.data = data;
    this.cateData = cateData;
    this.classData = classData;
    this.departmentData = departmentData;

    this.bookWidth = 130;
    this.offsetX = 20;
    this.rowHeight = 136;
    this.firstRowOverHeight = this.userData.isShowCategory == "1" ? 42 : 0; // first row height is 172, seems to be 36, but set 42 fix ipad issue
    this.total = this.data.length;
    this.current = 1;
    this.pages = 1;
    this.needReload = false;
    this.cache = [];
    this.skins = ["gold"];
    this.currentSkinId = this.skins.indexOf(userData.skin || "gold");
    this.isShowSkin = false;
    this.sortBy = "New2Old";

    this.body = $("body");

    this.body.addClass(userData.skin ? userData.skin : this.skins[this.currentSkinId]);

    this.panel = $("<div class='bookcase-panel'></div>");
    this.navContainer = $("<div class='nav-container'><div class='nav-left'></div><div class='nav-middle'></div><div class='nav-right'></div></div>");

    this.navBrandingContainer = $("<div class='nav-branding-container'></div>");
    this.navTitle = $("<a rel='nofollow' class='font-style' target='_blank'>" + userData.title + "</a>");
    logoLink = this.userData.logoLink;
    if (logoLink !== "" && !logoLink.match("http")) {
        logoLink = "http://" + logoLink;
    }
    if (logoLink !== "") {
        this.navTitle.attr("href", logoLink);
    }
    if (this.userData.isShowContact === "0") {
        this.navBrandingContainer.addClass("disabled");
    }

    this.searchContainer = $("<div class='search-container'></div>");
    this.searchInput = $("<input class='input-style' type='text'>");
    this.searchButton = $("<div class='search-icon'></div>");
    this.searchCancelButton = $("<div class='search-cancel-icon hide'></div>");

    if (this.userData.isShowSearch === "0") {
        this.searchContainer.addClass("hide");
    }

    this.caseContainer = $("<div class='case-container'></div>");
    this.caseBackground = $("<div class='case-background'></div>");
    this.casePageContainer = $("<div class='case-page-container user-select-none'></div>");

    this.caseCateSelectContainer = $("<div class='case-cate-select-container'></div>");
    this.caseCateSelectInner = $("<div class='case-cate-select-inner input-style as-input'></div>");

    this.messageContainer = $("<div class='case-message vertical hide'></div>");
    this.messageContent = $("<div class='vertical-content'></div>");

    this.controlPanel = $("<div class='control-panel user-select-none'></div>");
    this.prevButton = $("<div class='control-button control-prev-button'></div>");
    this.nextButton = $("<div class='control-button control-next-button'></div>");

    this.pageInput = $("<input type='text' class='page-num-input input-style'>");

    this.skinButton = $("<div class='skin-button'></div>");
    this.skinPanel = $("<ul class='skin-panel'><li></li><li></li><li></li><li></li><li></li></ul>");

    if (this.userData.isShowSkin === "0") {
        this.skinButton.addClass("hide");
    }

    this.navRightButtonContainer = $("<div class='nav-right-button-container'></div>");

    this.sortPanel = $("<div class='sort-panel user-select-none'></div>");
    this.sortNameButton = $("<div class='sort-button sort-name-button'></div>");
    this.sortCategoryButton = $("<div class='sort-button sort-cate-button'></div>");
    this.sortDepartmentButton = $("<div class='sort-button sort-date-button'></div>");

    // logo
    this.bottomLogo = $("<span class='bottom-logo-link'></span>");
    this.bottomLogoImg = $("<img />");

    var logoLink, logoAddress = "", logoSrc = "";

    if (this.userData.isShowLogo === "1") {
        this.bottomLogo.fadeIn();
        logoSrc = this.userData.logoAddress;
        this.bottomLogoImg.attr("src", logoSrc);
    }

    var self = this,
        $skinButtons = this.skinPanel.find("li");

    $skinButtons.eq(this.currentSkinId).addClass("skin-chosen");

    this.skinButton.hammer().on("tap", function () {
        if (self.isShowSkin) {
            self.skinPanel.css({
                height: 0,
                bottom: 5,
                opacity: 0
            });
            self.isShowSkin = false;
        } else {
            self.skinPanel.css({
                height: 200,
                bottom: 205,
                opacity: 1
            });
            self.isShowSkin = true;
        }
    });

    this.skinPanel.find("li").each(function (i, elem) {
        var $elem = $(elem);
        $elem.hammer().on("tap", function () {
            $skinButtons.eq(self.currentSkinId).removeClass("skin-chosen");

            self.body.removeClass(self.skins[self.currentSkinId]);
            self.body.addClass(self.skins[i]);

            $elem.addClass("skin-chosen");
            self.currentSkinId = i;
        });
    });

    this.bottomLogo.hammer().on("tap", function () {
        if (self.userData.isShowContact === "1") {
            new UserDetailPanel(userData);
        }
    });

    this.pageInput.on("keypress", function (e) {
        if (e.which === 13) {
            var value = self.pageInput.val().trim(),
                page = parseInt(value, 10);

            if (isNaN(page)) {
                page = 1;
            }

            self.skipTo(page);
        }
    });

    this.pageInput.on("focus", function () {
        self.pageInput.val("");
    });

    this.pageInput.on("blur", function () {
        var value = self.pageInput.val().trim();
        if (value === "") {
            self.pageInput.val(self.current + " / " + self.pages);
        }
    });

    this.casePageContainer.hammer().on("tap", ".book-img-wrapper", function (e) {

        var index = this.id;

        var url;
        self.data[index]._domainUrl = self.data[index].url;

        switch (self.userData.openType) {
            case "1":
                DemoPanel(this.data.title, this.data._domainUrl);
                break;
            case "2":
                window.open(self.data[index]._domainUrl);
                break;
            default:
                new BookDetailPanel($(this).clone(), self.data[index]);
        }

    });

    this.searchButton.hammer().on("tap", this.search.bind(this));
    this.searchCancelButton.hammer().on("tap", this.cancelSearch.bind(this));
    this.searchInput.on("keypress", function (e) {
        if (e.which === 13) {
            self.search();
        }
    });

    utils.addPlaceHolder(this.searchInput, "Ara");

    this.prevButton.hammer().on("tap", this.prev.bind(this));
    this.nextButton.hammer().on("tap", this.next.bind(this));

    this.caseContainer.on("touchmove", function (e) {
        e.preventDefault();
    });

    this.casePageContainer.hammer().on("swipeleft", function (e) {
        self.next();
    });

    this.casePageContainer.hammer().on("swiperight", function (e) {
        self.prev();
    });

    this.panel
        .append(this.navContainer
            .append(this.bottomLogo
                .append(this.bottomLogoImg)
            )
            .append(this.navBrandingContainer
                .append(this.navTitle)
            )
            .append(this.searchContainer
                .append(this.searchInput)
                .append(this.searchButton)
                .append(this.searchCancelButton)
            )
        )
        .append(this.caseContainer
            .append(this.caseBackground)
            .append(this.casePageContainer)
            .append(this.messageContainer
                .append(this.messageContent)
            )
            .append(this.navRightButtonContainer
                .append(this.sortPanel
                    .append(this.sortNameButton)
                    .append(this.sortCategoryButton)
                    .append(this.sortDepartmentButton)
                )
            )
        )
        .append(this.controlPanel
                .append(this.prevButton)
                .append(this.pageInput)
                .append(this.nextButton)
                .append(this.skinButton
                    .append(this.skinPanel)
                )
            )
        .appendTo($container);
    //sýnýf combobox ekleme
    this.classData.unshift({
        value: "-1",
        label: "Hepsi",
        isDefault: true
    });
    this.caseClassSelect = new SmartSelect({
        container: this.sortNameButton,
        data: this.classData,
        changeCallback: function () {
            self.search();
        }
    });
    //tür combobox ekleme
    this.cateData.unshift({
        value: "-1",
        label: "Hepsi",
        isDefault: true
    });
    this.caseCategorySelect = new SmartSelect({
        container: this.sortCategoryButton,
        data: this.cateData,
        changeCallback: function () {
            self.search();
        }
    });
    //branþ combobox ekleme
    this.departmentData.unshift({
        value: "-1",
        label: "Hepsi",
        isDefault: true
    });
    this.caseDepartmentSelect = new SmartSelect({
        container: this.sortDepartmentButton,
        data: this.departmentData,
        changeCallback: function () {
            self.search();
        }
    });

    var timeoutId = null;

    $(window).on("resize", function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            self.resize();
        }, 50);
    });

    this.resize();
}

Bookcase.prototype = {

    shakeMessage: function () {
        this.messageContainer
        .animate({
            left: "-=2px"
        }, 50)
        .animate({
            left: "+=4px"
        }, 50)
        .animate({
            left: "-=4px"
        }, 50)
        .animate({
            left: "+=2px"
        }, 50);
    },

    showMessage: function (message, isAutoFadeOut) {
        this.messageContent.html(message);
        this.messageContainer.stop(true, true).fadeIn();
        if (isAutoFadeOut) {
            this.messageContainer.stop(true, true).delay(1000).fadeOut();
        }
    },

    hideMessage: function () {
        this.messageContainer.hide();
    },

    getInputAutoWidth: function ($input) {
        var value = this.pageInput.val(),
            $clone = $("<div></div>").text(value).css({
                fontSize: this.pageInput.css("font-size"),
                display: this.pageInput.css("display"),
                padding: this.pageInput.css("padding"),
                opacity: 0
            }).appendTo($input.parent()),
            result = $clone.outerWidth();

        $clone.remove();

        return result;
    },

    cancelSearch: function () {
        this.searchInput.val("").focus();
        this.searchCancelButton.hide();
        this.searchButton.show();
        this.hideMessage(0);
        this.search();
    },

    search: function () {
        var self = this,
            keywords = this.searchInput.val().trim().toLowerCase(),
            categoryid = this.caseCategorySelect && this.caseCategorySelect.val(),
            sinifid = this.caseClassSelect && this.caseClassSelect.val(),
            bransid = this.caseDepartmentSelect && this.caseDepartmentSelect.val(),
            i,
            len = this.originalData.length,
            result = [];

        if (keywords === "ara") {//aranacak kelime "ara" ise arama yapma sakýn
            keywords = "";
        }

        if (keywords != "") {//arancak kelime yoksa eski haline gel
            this.searchButton.hide();
            this.searchCancelButton.show();
        } else {
            this.searchButton.show();
            this.searchCancelButton.hide();
        }

        for (i = 0; i < len; i++) {
            var title = this.originalData[i].title.toLowerCase(),
                desc = this.originalData[i].description.toLowerCase();

            // filter keywords
            if (title.match(keywords) || desc.match(keywords)) { //baþlýkta veya açýklamada varsa aranana kelime
                // filter
                if (this.originalData[i].categoryid == categoryid || categoryid == -1) {
                    if (this.originalData[i].sinifid == sinifid || sinifid == -1) {
                        if (this.originalData[i].bransid == bransid || bransid == -1) {
                            result.push(this.originalData[i]);
                        }
                    }
                }
            }
        }

        this.data = result;
        this.resize(true);

        if (result.length === 0) {
            var $message = $("<p>Sonu&ccedil; yok. </p>"),
                $backButton = $("<a href='javascript:void(0);'>Geri</a>").appendTo($message);

            $backButton.hammer().on("tap", function () {
                self.cancelSearch();
            });

            self.showMessage($message);
        } else {
            self.hideMessage();
        }
    },

    autoFitToBottom: function ($container, $imgWrapper, $img, index) {
        var self = this,
            img = new Image();

        var $loading = $("<div class='loading'><img src='Includes/Bookcase/loading.gif'></div>").appendTo($container);
        img.onload = function () {

            var containerHeight = $container.height(),
                containerWidth = $container.width(),
                aspectRatio = img.width / img.height,
                height = containerHeight,
                width = containerHeight * aspectRatio,
                left,
                top;

            if (width > containerWidth) {
                width = containerWidth;
                height = containerWidth / aspectRatio;
            }

            left = (containerWidth - width) / 2;
            top = containerHeight - height;

            $imgWrapper.css({
                width: width,
                height: height,
                left: left,
                top: top
            });

            //add border
            var level = 4,
                i,
                $borderContainer = $("<div class='book-border-container'></div>");

            $borderContainer.css({
                right: -level,
                width: level
            });

            for (i = 0; i < level; i++) {
                var $border = $("<div></div>").css({
                    position: "absolute",
                    width: 1,
                    background: i % 2 == 0 ? "#ccc" : "#fff",
                    height: height - 2 * (i + 1),
                    top: i + 1,
                    left: i + 1
                }).appendTo($borderContainer);
            }
            $img.after($borderContainer);

            setTimeout(function () {
                $imgWrapper.fadeIn(400, function () {
                    self.cache[index] = $container;
                });
                $loading.remove();
            }, 50);
        };
        img.onerror = function () {

            var $asImg = $("<div class='as-book-img'></div>"),
                containerHeight = $container.height(),
                containerWidth = $container.width(),
                aspectRatio = 3 / 4,
                height = containerHeight,
                width = containerHeight * aspectRatio,
                left,
                top;

            if (width > containerWidth) {
                width = containerWidth;
                height = containerWidth / aspectRatio;
            }

            left = (containerWidth - width) / 2;
            top = containerHeight - height;

            $imgWrapper.css({
                width: width,
                height: height,
                left: left,
                top: top
            });

            //add border
            var level = 4,
                i,
                $borderContainer = $("<div class='book-border-container'></div>");

            $borderContainer.css({
                right: -level,
                width: level
            });

            for (i = 0; i < level; i++) {
                var $border = $("<div></div>").css({
                    position: "absolute",
                    width: 1,
                    background: i % 2 == 0 ? "#ccc" : "#fff",
                    height: height - 2 * (i + 1),
                    top: i + 1,
                    left: i + 1
                }).appendTo($borderContainer);
            }
            $img.after($asImg).after($borderContainer);

            setTimeout(function () {
                $img.hide();
                $imgWrapper.fadeIn(400, function () {
                    self.cache[index] = $container;
                });
            }, 50);
            $loading.remove();
        };
        img.src = $img.attr("src");
    },

    skipTo: function (i) {

        // fix index
        if (i > this.pages) {
            i = this.pages;
        } else if (i < 1) {
            i = 1;
        }

        this.pageInput.val(i + " / " + this.pages);

        if (i == this.current && !this.needReload) {
            return;
        }

        // var $currentPage = this.casePageContainer.find("#page-" + this.current).hide(),
        var $currentPage = this.casePageContainer.find("#page-" + this.current),
            $targetPage = this.casePageContainer.find("#page-" + i),
            $prevPage = this.casePageContainer.find("#page-" + (i - 1)),
            $nextPage = this.casePageContainer.find("#page-" + (i + 1));

        if ($targetPage && $targetPage.length > 0) {
            // $targetPage.show();
        } else {
            $targetPage = this.createPage(i);
        }

        if (i < this.current) {

            $currentPage.css({
                webkitTransform: "translateX(100%)",
                mozTransform: "translateX(100%)",
                oTransform: "translateX(100%)",
                msTransform: "translateX(100%)",
                transform: "translateX(100%)",
                opacity: 0
            });

            $targetPage.css({
                webkitTransform: "translateX(0%)",
                mozTransform: "translateX(0%)",
                oTransform: "translateX(0%)",
                msTransform: "translateX(0%)",
                transform: "translateX(0%)",
                opacity: 1
            });

        } else {

            $currentPage.css({
                webkitTransform: "translateX(-100%)",
                mozTransform: "translateX(-100%)",
                oTransform: "translateX(-100%)",
                msTransform: "translateX(-100%)",
                transform: "translateX(-100%)",
                opacity: 0
            });

            $targetPage.css({
                webkitTransform: "translateX(0%)",
                mozTransform: "translateX(0%)",
                oTransform: "translateX(0%)",
                msTransform: "translateX(0%)",
                transform: "translateX(0%)",
                opacity: 1
            });

        }

        // current page is not the last page and next page doesn't exist, then preload next page
        if ((i !== this.pages) && !($nextPage && $nextPage.length > 0)) {
            this.createPage(i + 1, true);
        }

        // current page is not the first page and prev page doesn't exist, then preload prev page
        if ((i !== 1) && !($prevPage && $prevPage.length > 0)) {
            this.createPage(i - 1, true);
        }

        // handle button
        if (i === 1) {
            this.prevButton.addClass("disabled");
            this.nextButton.removeClass("disabled");
        } else if (i === this.pages) {
            this.nextButton.addClass("disabled");
            this.prevButton.removeClass("disabled");
        } else {
            this.prevButton.removeClass("disabled");
            this.nextButton.removeClass("disabled");
        }

        if (this.pages === 1) {
            this.prevButton.addClass("disabled");
            this.nextButton.addClass("disabled");
        }

        this.current = i;
    },

    getLabelFilePath: function (id) {
        var path = "";
        switch (id) {
            case "1":
                path = 'Includes/Bookcase/label-new.png';
                break;
            case "2":
                path = 'Includes/Bookcase/label-hot.png';
                break;
            case "3":
                path = 'Includes/Bookcase/label-featured.png';
                break;
        }
        return path;
    },

    createPage: function (i, isPreload) {

        var $targetPage = $("<div id='page-" + i + "' class='single-page'></div>");

        // if (isPreload) {
        //     $targetPage.addClass("hide");
        // }
        for (r = 0; r < this.rows; r++) {
            if (this.userData.isShowCategory == "1" && r == 0) {
                $row = $("<div class='case-row big'></div>");
            } else {
                $row = $("<div class='case-row'></div>");
            }
            $bookWarpper = $("<div class='book-wrapper'></div>").width(this.cols * this.bookWidth);
            for (c = 0; c < this.cols; c++) {
                index = (i - 1) * (this.rows * this.cols) + r * this.cols + c;
                if (index < this.total) {

                    if (this.cache[index] && this.cache[index].length > 0) {
                        $bookContianer = this.cache[index];
                    } else {
                        $bookContianer = $("<div class='book-container'></div>");
                        $imgWrapper = $("<div id='" + index + "' class='book-img-wrapper'></div>");
                        $img = $("<img class='book-img' src='" + this.data[index].kapak + "'/>").appendTo($bookContianer);
                        $label = $("<img class='book-label' src='" + this.getLabelFilePath(this.data[index].label) + "'>");
                        $priceLabel = $("<div class='price-label' title='" + this.data[index].sinif + "'>" + this.data[index].sinif + "</div>");

                        if (this.data[index].label == "0") {
                            $label.hide();
                        }

                        $bookContianer
                            .append($imgWrapper
                                .append($img)
                                .append($label)
                                .append($priceLabel)
                            );

                        this.autoFitToBottom($bookContianer, $imgWrapper, $img, index);
                    }

                    $bookContianer.appendTo($bookWarpper);

                }
            }
            $row.append($bookWarpper).appendTo($targetPage);
        }
        $targetPage.appendTo(this.casePageContainer);

        return $targetPage;
    },

    prev: function () {
        if (this.current === 1) {
            return;
        }
        this.skipTo(this.current - 1);
    },

    next: function () {
        if (this.current === this.pages) {
            return;
        }
        this.skipTo(this.current + 1);
    },

    resize: function (isDataChanged) {

        if (isDataChanged) {
            this.total = this.data.length;
            this.cache = [];
        }

        // cache data
        if (typeof this.topHeight === "undefined") {
            this.topHeight = this.navContainer.height();
            this.bottomHeight = this.controlPanel.height();
        }

        var height = this.container.height(),
            width = this.container.width(),
            // total - nav - control - first row over
            rows = Math.floor((height - this.topHeight - this.firstRowOverHeight) / this.rowHeight),
            rows = rows > 0 ? rows : 1,
            cols = Math.floor(((width - this.offsetX * 2) / this.bookWidth)),
            pages = Math.ceil(this.total / (rows * cols)) || 1,
            r;

        //sýnýf,brans düðmelerini ortala
        this.navRightButtonContainer.css("left", Math.floor((width - this.navRightButtonContainer.width()) / 2));

        if (isDataChanged || rows !== this.rows || cols != this.cols) {
            this.casePageContainer.empty();
            this.needReload = true;
        } else {
            this.needReload = false;
        }

        this.rows = rows;
        this.cols = cols;
        this.pages = pages;

        this.caseBackground.empty();
        for (r = 0; r < rows; r++) {
            if (this.userData.isShowCategory == "1" && r == 0) {
                this.caseBackground.append($("<div class='case-row big'><div class='case-left'></div><div class='case-middle'></div><div class='case-right'></div></div>"));
            } else {
                this.caseBackground.append($("<div class='case-row'><div class='case-left'></div><div class='case-middle'></div><div class='case-right'></div></div>"));
            }
        }

        if (this.current > this.pages) {
            this.current = this.pages;
        }
        this.skipTo(this.current);

        this.pageInput.width(this.getInputAutoWidth(this.pageInput));
    }
};

function LightBox(title, width, skin) {
    this.width = width;
    if (window.innerWidth < width || width == "auto") {
        width = window.innerWidth;
    }

    this.background = $("<div class='light-box-background'></div>");
    this.box = $("<div class='light-box'></div>").width(width).addClass(skin);
    this.panel = $("<div class='light-box-panel'></div>");
    this.title = $("<div class='light-box-title'>" + title + "</div>");
    this.cancelButton = $("<div class='light-box-cancel-button'>x</div>");

    this.box
        .append(this.title
            .append(this.cancelButton)
    )
        .append(this.panel);

    this.document = $(document);
    this.isNoResize = false;

    $(window).on("resize", this.resize.bind(this, 0));
    this.cancelButton.hammer().on("tap", this.cancel.bind(this));
    this.background.hammer().on("tap", this.cancel.bind(this));
}

LightBox.prototype = {
    constructor: LightBox,

    getBox: function () {
        return this.box;
    },

    getPanel: function () {
        return this.panel;
    },

    launch: function (hasInput) {
        var $body = $("body"),
            self = this,
            top;

        // fix ipad input focus will trigger resize event issue
        if (hasInput) {
            var $inputs = this.box.find("input, textarea");
            $inputs.each(function (i, elem) {
                var $elem = $(elem);
                $elem.on("focus", function () {
                    self.isNoResize = true;
                });
                $elem.on("blur", function () {
                    self.isNoResize = false;
                })
            });
        }

        this.background.appendTo($body).fadeIn();
        this.box.appendTo($body);
        this.resize(0);

        if (self.box.height() > window.innerHeight) {
            top = self.document.scrollTop() + 0;
        } else {
            top = (window.innerHeight - this.box.height()) / 2 + this.document.scrollTop();
        }

        this.box.css("top", this.document.scrollTop()).animate({
            opacity: 1,
            top: top
        }, 200);
    },

    cancel: function () {
        var self = this;

        self.background.fadeOut(function () {
            self.background.remove();
        });

        self.box.animate({
            opacity: 0,
            top: this.document.scrollTop()
        }, 200, function () {
            self.box.remove();
        });
    },

    resizeH: function () {
        this.box.css({
            left: (window.innerWidth - this.box.width()) / 2
        });
    },

    resize: function (duration) {
        if (window.innerWidth < this.width || this.width == "auto") {
            this.box.width(window.innerWidth);
        } else {
            this.box.width(this.width);
        }

        if (this.isNoResize) {
            return;
        }

        if (typeof duration === "undefined") {
            duration = 400;
        }

        var top;

        if (this.box.outerHeight() > window.innerHeight) {
            top = this.document.scrollTop();
        } else {
            top = this.document.scrollTop() + (window.innerHeight - this.box.outerHeight()) / 2
        }

        this.box.animate({
            left: (window.innerWidth - this.box.outerWidth()) / 2,
            top: top
        }, duration);



    },
};

function DemoPanel(title, url, width, height) {

    if (document.location.protocol === "https:") {
        url = "http://dijital.tedes.com.tr/" + url.replace("http://", "") + "index.html";
    }

    this.lightBox = new LightBox(title + "&nbsp;&nbsp;<a target='_blank' href='" + url + "'>Yeni pencerede a&ccedil;</a>", "auto");

    // this.iframe = $("<iframe allowfullscreen frameborder='0' src='" + url + "'></iframe>");
    this.iframe = $("<iframe allowfullscreen frameborder='0'></iframe>");

    var self = this;
    setTimeout(function () {
        self.iframe.attr("src", url);
    }, 300);

    this.iframe.on("touchmove", function (e) {
        e.preventDefault();
    });

    $(window).on("resize", this.resize.bind(this));
    this.resize();

    this.lightBox.getPanel().addClass("padding-xs")
        .append(this.iframe);

    this.lightBox.launch();
}

DemoPanel.prototype = {
    resize: function () {
        this.lightBox.resize(0);
        this.iframe.width(window.innerWidth - 10);
        this.iframe.height(window.innerHeight - 65);
        this.lightBox.resize(0);
    }
};

function BookDetailPanel($imgWrapper, data) {

    this.data = data;

    this.boxWidth = 485;

    this.lightBox = new LightBox("Ayr&#305;nt&#305;lar", this.boxWidth);

    this.panel = $("<div class='light-box-panel'></div>");
    //var containerWidth = (window.innerWidth < this.boxWidth ? window.innerWidth : this.boxWidth) - 270;

    this.detailContainer = $("<div class='book-detail-container'></div>");
    this.bookContainer = $("<div class='book-detail-book-container'></div>");
    this.shelf = $("<img class='book-detail-book-shelf' src='Includes/Bookcase/shelf.png'>");

    this.title = $("<div class='book-detail-title'>" + data.title + "</div>");
    this.info = $("<div class='book-detail-info'>Sayfa: " + data.pages + "</div>");
    this.desc = $("<div class='book-detail-desc' title='" + data.description + "'>" + data.description + "</div>");
    this.viewButton = $("<div class='button button-blue button-rounded button-block button-large'>A&ccedil;</div>");

    $imgWrapper.hammer().on("tap", this.view.bind(this));
    this.viewButton.hammer().on("tap", this.view.bind(this));

    this.lightBox.getPanel()
        .append(this.detailContainer
            .append(this.bookContainer
                .append($imgWrapper.prepend(this.shelf))
            )
            .append(this.title)
            .append(this.info)
            .append(this.desc)
            .append(this.viewButton)
        )
    ;

    $(window).on("resize", this.resize.bind(this));
    this.resize();

    this.lightBox.launch();


}

BookDetailPanel.prototype = {
    view: function () {
        RunFile(this.data._domainUrl)
    },

    resize: function () {
        this.detailContainer.width((window.innerWidth < this.boxWidth ? window.innerWidth : this.boxWidth) - 270);
    }
};
//kitaplýk baþýndaki isme týklayýnca açýlan bölüm
function UserDetailPanel(data) {

    var lightBox = new LightBox("&#304;leti&#351;im", 485);
    this.lightBox = lightBox;
    this.data = data;
    this.userGroup = $("<div class='row user-info-container float-fix'></div>");
    this.userLogoContainer = $("<div class='user-logo-container'></div>");
    this.userLogo = $("<img src='" + data.accountLogo + "'>");
    this.userInfoGroup = $("<div class='left user-info-group'></div>");
    this.userName = $("<p>" + data.name + "</p>");
    this.userAbout = $("<p>" + data.about + "</p>");
    this.userWebsite = $("<p><strong>Web:</strong> <a target='_blank' href='" + (data.website.match("https?://") ? data.website : "//" + data.website) + "'>" + data.website + "</a></p>");
    if (data.website == "") {
        this.userWebsite.addClass('hide');
    }

    this.contactForm = $("<div></div>");
    this.nameInput = $("<input class='user-info-input' type='text' placeholder='Ad&#305;n&#305;z' value=''></input>");
    this.emailInput = $("<input class='user-info-input' type='email' placeholder='E-mail Adresiniz' value=''></input>");
    this.subjectInput = $("<input class='user-info-input' type='text' placeholder='Konu' value=''></input>");
    this.messageArea = $("<textarea class='user-info-textarea' rows='4' placeholder='Mesaj'></textarea>");
    this.buttonGroup = $("<div class='row text-center'></div>");
    this.sendButton = $("<div class='button button-gray button-rounded button-block button-large'>G&ouml;nder</div>");

    this.successGroup = $("<div class='alert-success user-info-mail-status-container hide'></div>");
    this.successText = $("<p>Mesaj g&ouml;nderildi!</p>");
    this.successButtonGroup = $("<div class='row'></div>");
    this.successAnotherButton = $("<div class='button button-blue button-rounded marginX'>Ba&#351;ka mesaj  g&ouml;nder</div>");
    this.successCloseButton = $("<div class='button button-gray button-rounded marginX'>Kapat</div>");

    this.sendingGroup = $("<div class='alert-info user-info-mail-status-container hide'></div>");
    this.sendingText = $("<p>G&ouml;nderiliyor...</p>");

    this.errorGroup = $("<div class='alert-error user-info-mail-status-container hide'></div>");
    this.errorText = $("<p>Oops! Olmad&#305;. Daha sonra tekrar dene.</p>");
    this.errorButtonGroup = $("<div class='row'></div>");
    this.errorReSendButton = $("<div class='button button-blue button-rounded marginX'>Tekrar G&ouml;nder</div>");
    this.errorCloseButton = $("<div class='button button-gray button-rounded marginX'>Kapat</div>");

    lightBox.getPanel()
        .append(this.userGroup
            .append(this.userLogoContainer
                .append(this.userLogo)
            )
            .append(this.userInfoGroup
                .append(this.userName)
                .append(this.userAbout)
                .append(this.userWebsite)
            )
        )
        .append(this.contactForm
            .append(this.nameInput)
            .append(this.emailInput)
            .append(this.subjectInput)
            .append(this.messageArea)
            .append(this.buttonGroup
                .append(this.sendButton)
            )
        )
        .append(this.sendingGroup
            .append(this.sendingText)
        )
        .append(this.successGroup
            .append(this.successText)
            .append(this.successButtonGroup
                .append(this.successAnotherButton)
                .append(this.successCloseButton)
            )
        )
        .append(this.errorGroup
            .append(this.errorText)
            .append(this.errorButtonGroup
                .append(this.errorReSendButton)
                .append(this.errorCloseButton)
            )
        )
    ;

    this.sendButton.hammer().on("tap", this.send.bind(this));

    this.successAnotherButton.hammer().on("tap", this.sendAnother.bind(this));
    this.successCloseButton.hammer().on("tap", this.close.bind(this));

    this.errorReSendButton.hammer().on("tap", this.reSend.bind(this));
    this.errorCloseButton.hammer().on("tap", this.close.bind(this));

    lightBox.launch(true);
}

UserDetailPanel.prototype = {

    sendAnother: function () {
        this.lightBox.cancel();
        new UserDetailPanel(this.data);
    },

    close: function () {
        this.lightBox.cancel();
    },

    reSend: function () {
        this.errorGroup.slideUp();
        this.sendingGroup.slideDown();
        this.send();
    },

    send: function () {

        var self = this,
            name = this.nameInput.val().trim(),
            email = this.emailInput.val().trim(),
            subject = this.subjectInput.val().trim(),
            message = this.messageArea.val().trim(),
            toName = this.data.name,
            toEmail = this.data.email;

        if (!utils.validateForm(this.contactForm)) {
            return;
        }

        $.ajax({
            type: "post",
            url: "/Email/bookcase.email.php",
            data: {
                fromFullName: name,
                fromEmail: email,
                fromSubject: subject,
                fromMessage: message,
                toName: toName,
                toEmail: toEmail,
                Code: hex_md5(encodeURIComponent(name + email + subject + message + toName + toEmail + "fliphtml5"))
            },
            beforeSend: function () {
                self.contactForm.slideUp();
                self.sendingGroup.slideDown();
            },
            success: function (data) {
                self.sendingGroup.slideUp();
                if (data == "1") {
                    self.successGroup.slideDown();
                } else {
                    self.errorGroup.slideDown();
                }
            },
            error: function () {
                self.sendingGroup.slideUp();
                self.errorGroup.slideDown();
            }
        });
    }
};

function SmartSelect(options) {

    var defaults = {
        container: null,
        data: [],
        changeCallback: function () {
        }
    }

    this.options = $.extend({}, defaults, options);

    this.showing = false;

    var i,
        data = this.options.data,
        len = data.length,
        self = this,
        $items;
    this.valueContainer = $("<div class='hide'></div>");
    this.optionContainer = $("<ul class='cc-smart-select-option-ul'></ul>");

    for (i = 0; i < len; i++) {
        this.optionContainer.append("<li data-value=" + data[i].value + " data-label='" + data[i].label + "'>" + data[i].label + "</li>");
        if (data[i].isDefault) {
            this.valueContainer.text(data[i].label).data("value", data[i].value);
        }
    }


    this.options.container
        .append(this.optionContainer);

    $items = this.optionContainer.find("li");

    $items.css({
        paddingLeft: this.options.container.css("paddingLeft")
    });
    self.optionContainer.hide();
    this.optionContainer.hammer().on("tap", this.choose.bind(this));

    this.options.container.hammer().on("tap", this.toggleOption.bind(this));

    // this.options.container.on("mouseleave", this.hideOptions.bind(this));

    $(document).hammer().on("tap", function (e) {
        if (!($.contains(self.options.container[0], e.target) || self.options.container[0] == e.target)) {
            self.hideOptions();
        }
    });
}

SmartSelect.prototype = {
    constructor: SmartSelect,

    val: function () {
        return this.valueContainer.data("value");
    },

    choose: function (e) {
        $target = $(e.target);
        if ($target.is("li")) {
            this.valueContainer.text($target.data("label")).data("value", $target.data("value"));
            if (this.options.changeCallback) {
                this.options.changeCallback($target.data("value"));
            }
        }
    },

    toggleOption: function () {
        if (this.showing) {
            this.hideOptions();
        } else {
            this.showOptions();
        }
    },

    showOptions: function () {
        var self = this;
        self.optionContainer.stop().show().animate({
            marginTop: 0,
            opacity: 1
        }, 200, function () {
            self.showing = true;
        });
    },

    hideOptions: function () {
        var self = this;
        self.optionContainer.stop().animate({
            marginTop: -3,
            opacity: 0
        }, 100, function () {
            self.showing = false;
            self.optionContainer.hide();
        });
    }
}
