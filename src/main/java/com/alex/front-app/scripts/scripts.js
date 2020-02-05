const $ = require("jquery");
const fs = require("fs");
const path = require("path");

const MapObject = {
    genreMap: new Map(),
    authorMap: new Map(),
    bookMap: new Map()

};

const Objects = {
  AUTHOR: "Author",
  BOOK: "Book",
  GENRE: "Genre"
};

$(document).ready(() => {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname + "/../config.json")).toString());


    $("#button1").click(() => {
        $("#wrapper1").css({display: ""});
        $("#wrapper2").css({display: "none"});
        $("#wrapper3").css({display: "none"});
    });

    $("#button2").click(() => {
        $("#wrapper1").css({display: "none"});
        $("#wrapper2").css({display: ""});
        $("#wrapper3").css({display: "none"});
    });

    $("#button3").click(() => {
        $("#wrapper1").css({display: "none"});
        $("#wrapper2").css({display: "none"});
        $("#wrapper3").css({display: ""});
    });


    $("input[readonly='readonly']").click(function() {
        let text = $(this).val();

        if(text !== "") alert(text);
    });

    ajaxGetSend(config, Objects.BOOK);
    ajaxGetSend(config, Objects.GENRE);
    ajaxGetSend(config, Objects.AUTHOR);

    console.log(MapObject.bookMap);


    $("#removeBook").click(() => {
        ajaxPostRemove(config, Objects.BOOK);
        refreshBookInfo();
    });

    $("#addBook").click(() => {
        createObject(config, Objects.BOOK);
    });

    $("#infoAboutBook").change(function() {

        let id = $(this).find("option:selected").val();
        if(id === "none") return void(0);
        else {
            let book = MapObject.bookMap.get(parseInt(id, 10));
            $("#booksTitle").val(book.title);
            $("#booksDescription").val(book.description);
            let author = MapObject.authorMap.get(book.authorId);
            $("#booksAuthor").val(author.name + " " + author.surname);
            $("#booksGenre").val(MapObject.genreMap.get(book.genreId).name);
            $("#booksYear").val(parseInt(book.year, 10));
        }
    });

    $("#removeAuthor").click(() => {
        $(`#infoAboutBook`).find("option[value='none']").prop("selected");
        ajaxPostRemove(config, Objects.AUTHOR);
        $("#authorsNameSurname").val("");
        $("#authorsBooks").find("option").each(function() {
            if($(this).val() !== "none") $(this).remove();
        });
    });

    $("#addAuthor").click(() => {
        $(`#infoAboutBook`).find("option[value='none']").prop("selected");
        createObject(config, Objects.AUTHOR);
    });

    $("#infoAboutAuthor").change(function() {

        let id = $(this).find("option:selected").val();
        if(id === "none") return void(0);
        else {
            let author = MapObject.authorMap.get(parseInt(id, 10));
            $("#authorsNameSurname").val(author.name + " " + author.surname);
            let books = [];
            $("#authorsBooks").find("option").each(function() {
                if($(this).val() !== "none") $(this).remove();
            });
            author.bookIds.split(",").forEach(el => books.push(MapObject.bookMap.get(parseInt(el, 10))));
            books.forEach(book => {
                if(book) $("#authorsBooks").append(`<option value="${book.id}" disabled> ${book.title} </option>`);
            });
        }
    });



    $("#removeGenre").click(() => {
        ajaxPostRemove(config, Objects.GENRE);
        $("#genresName").val("");
        $("#genresDescription").val("");
        $("#infoAboutBook").trigger("change");
    });


    $("#addGenre").click(() => {
        createObject(config, Objects.GENRE);
    });

    $("#infoAboutGenre").change(function() {

        let id = $(this).find("option:selected").val();
        if(id === "none") return void(0);
        else {
            let genre = MapObject.genreMap.get(parseInt(id, 10));
            $("#genresName").val(genre.name);
            $("#genresDescription").val(genre.description);
        }
    });

});


function ajaxGetSend(config, object) {
    $.ajax({
        url: `http://${config.host}:${config.port}/get-${object.toLowerCase()}s`,
        type: "get",
        success: result => {
            result.forEach(res => {
                MapObject[object.toLowerCase()+"Map"].set(res.id, res);
                let option;
                if(res.name) option = `<option value="${res.id}">${res.name}</option>`;
                if(res.title) option = `<option value="${res.id}">${res.title}</option>`;
                if(res.surname) option = `<option value="${res.id}">${res.name} ${res.surname}</option>`;
                $(`.${object.toLowerCase()}`).each(function() {
                    $(this).append(option);
                });
            });
        }
    });
}

function ajaxPostRemove(config, object) {
    let selectedOption = $(`#remove${object}Form`).find("option:selected");
    if(selectedOption.val() === "none") return void(0);
    let $data = MapObject[object.toLowerCase()+"Map"].get(parseInt(selectedOption.val(), 10));
    $.ajax({
        url: `http://${config.host}:${config.port}/remove-${object.toLowerCase()}`,
        type: "post",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify($data),
        processData: false,
        success: res => {
            if(res === null) {
                throw new Error("Error: cannot remove genre");
            }
            else {
                $(`#infoAbout${object}`).find("option[value='none']").prop("selected");
                $(`.${object.toLowerCase()}`).each(function() {
                    $(this).find(`option[value="${res.id}"]`).remove();
                    MapObject[object.toLowerCase()+"Map"].delete(res.id);

                    if(object === Objects.BOOK) {
                        let author = MapObject.authorMap.get(res.authorId);
                        let str = `(${res.id},)`;
                        author.bookIds = author.bookIds.replace(new RegExp(str), "");
                        MapObject.authorMap.set(author.id, author);
                        $("#authorsBooks").find(`option[value="${res.id}"]`).remove();
                    }
                    if(object === Objects.AUTHOR) {
                        refreshBookInfo();
                        MapObject.bookMap.forEach((v, k) => {
                           if(v.authorId === res.id) {
                               MapObject.bookMap.delete(k);
                               $(".book").each(function() {
                                   $(this).find(`option[value="${k}"]`).remove();
                               });
                           }
                        });
                    }
                    if(object === Objects.GENRE) {
                        refreshBookInfo();
                        MapObject.bookMap.forEach((v, k) => {
                            if(v.genreId === res.id) {
                                MapObject.bookMap.delete(k);
                                $(".book").each(function() {
                                    $(this).find(`option[value="${k}"]`).remove();
                                });
                                let author = MapObject.authorMap.get(v.authorId);
                                let str = `(${k},)`;
                                author.bookIds = author.bookIds.replace(new RegExp(str), "");
                                MapObject.authorMap.set(author.id, author);
                                $("#authorsBooks").find(`option[value="${k}"]`).remove();
                            }
                        });

                    }
                });
            }
        }
    });
}

function refreshBookInfo() {
    $("#booksTitle").val("");
    $("#booksDescription").val("");
    $("#booksAuthor").val("");
    $("#booksGenre").val("");
    $("#booksYear").val("");
}

function createObject(config, object) {
    let $data = {
        id: null,
    };

    if(object === Objects.AUTHOR) {
        $data.bookIds = ""
    }

    $(`#new${object}Form`).find("input, select").each(function() {
        let value = $(this).find("option:selected").val();
        if (!value) {
            value = $(this).val();
            if (value.length >= 255) return alert(`Field\`s "${this.name}" length must be less then 255 characters long.`);
            if (value === "") return alert(`Field "${this.name}" must be specified!`);
            if(this.name === "year") $data[this.name] = parseInt(value, 10);
            else $data[this.name] = value;
            $(this).val("");
        }
        else {
            if(value === "none") {
                $data[this.className] = undefined;
                return alert(`Select ${this.className} or create new to choose!`);
            }
            $data[this.className+"Id"] = parseInt(value, 10);
            $(this).find("option[value='none']").attr("selected", "true");
        }
    });


    for(let prep in $data) {
        if(!$data[prep] && prep !== "id" && prep !== "bookIds") return void(0);
    }
    ajaxPostAdd(config, $data, object);
}


function ajaxPostAdd(config, $data, object) {
    $.ajax({
        url: `http://${config.host}:${config.port}/add-${object.toLowerCase()}`,
        type: "post",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify($data),
        processData: false,
        success: res => {
            if(res === null) {
                throw new Error("Error: cannot create new genre");
            }
            else {
                $(`#infoAbout${object}`).find("option[value='none']").prop("selected", "true");
                let option;
                if(res.name) option = `<option value="${res.id}">${res.name}</option>`;
                if(res.title) option = `<option value="${res.id}">${res.title}</option>`;
                if(res.surname) option = `<option value="${res.id}">${res.name} ${res.surname}</option>`;
                $(`.${object.toLowerCase()}`).each(function() {
                    $(this).append(option);
                    MapObject[object.toLowerCase()+"Map"].set(res.id, res);
                });
                if(object === Objects.BOOK) {
                    let author = MapObject.authorMap.get(res.authorId);
                    author.bookIds += `,${res.id}`;
                    MapObject.authorMap.set(author.id, author);
                    if(author.id == $("#infoAboutAuthor").find("option:selected").val()) $("#authorsBooks").append(`<option value="${res.id}" disabled> ${res.title} </option>`);
                }
            }
        }
    });
}