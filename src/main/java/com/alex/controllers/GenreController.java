package com.alex.controllers;

import com.alex.domain.Author;
import com.alex.domain.Genre;
import com.alex.repositories.AuthorRepository;
import com.alex.repositories.BookRepository;
import com.alex.repositories.GenreRepository;
import org.springframework.http.MediaType;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class GenreController {

    final
    GenreRepository genreRepository;
    final
    BookRepository bookRepository;
    final
    AuthorRepository authorRepository;

    public GenreController(GenreRepository genreRepository, BookRepository bookRepository, AuthorRepository authorRepository) {
        this.bookRepository = bookRepository;
        this.genreRepository = genreRepository;
        this.authorRepository = authorRepository;
    }

    @GetMapping(path = "/get-genres", produces = MediaType.APPLICATION_JSON_VALUE)
    public Iterable<Genre> getGenres() {
        return genreRepository.findAll();
    }


    @PostMapping(path = "/add-genre", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Genre addGenre(@RequestBody Genre genre, BindingResult result) {
        if(result.hasErrors()) return null;
        genreRepository.save(genre);
        return genre;
    }



    @PostMapping(path = "/remove-genre", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Genre removeGenre(@RequestBody Genre genre, BindingResult result) {
        if(result.hasErrors()) return null;
        try {
            genreRepository.deleteById(genre.getId());
            bookRepository.findAll().forEach(book -> {
                if(book.getGenreId() == genre.getId()) {
                    Author author;
                    if(authorRepository.findById(book.getAuthorId()).isPresent()) {
                        author = authorRepository.findById(book.getAuthorId()).get();
                        author.removeBook(book.getId());
                        authorRepository.save(author);
                        bookRepository.deleteById(book.getId());
                    }
                }
            });
            return genre;
        } catch (Exception e) {
            return null;
        }
    }




}



