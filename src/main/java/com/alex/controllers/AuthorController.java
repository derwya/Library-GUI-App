package com.alex.controllers;

import com.alex.domain.Author;
import com.alex.repositories.AuthorRepository;
import com.alex.repositories.BookRepository;
import org.springframework.http.MediaType;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthorController {
    final
    AuthorRepository authorRepository;
    final
    BookRepository bookRepository;


    public AuthorController(AuthorRepository authorRepository, BookRepository bookRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
    }

    @PostMapping("/remove-author")
    public Author removeAuthor(@RequestBody Author author, BindingResult result) {
        if(result.hasErrors()) return null;
        try {
            bookRepository.findAll().forEach(book -> {
                if(author.getId() == book.getAuthorId()) bookRepository.delete(book);
            });
            authorRepository.deleteById(author.getId());
            return author;
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping(path = "/get-authors", produces = MediaType.APPLICATION_JSON_VALUE)
    public Iterable<Author> getAuthors() {
        return authorRepository.findAll();
    }

    @PostMapping(path = "/add-author", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Author addAuthor(@RequestBody Author author, BindingResult result) {
        if(result.hasErrors()) return null;
        authorRepository.save(author);
        return author;
    }


}
