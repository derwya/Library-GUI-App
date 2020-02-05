package com.alex.controllers;

import com.alex.domain.Author;
import com.alex.domain.Book;
import com.alex.repositories.AuthorRepository;
import com.alex.repositories.BookRepository;
import org.springframework.http.MediaType;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class BookController {

    final
    BookRepository bookRepository;
    final
    AuthorRepository authorRepository;

    public BookController(BookRepository bookRepository, AuthorRepository authorRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
    }

    @GetMapping(path = "/get-books", produces = MediaType.APPLICATION_JSON_VALUE)
    public Iterable<Book> getBooks() {
        return bookRepository.findAll();
    }


    @PostMapping(path = "/remove-book", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)

    public Book removeBook(@RequestBody Book book, BindingResult result) {
        if(result.hasErrors()) return null;
        try {
            Author author = authorRepository.findById(book.getAuthorId()).get();
            author.removeBook(book.getId());
            authorRepository.save(author);
            bookRepository.deleteById(book.getId());
            return book;
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping(path = "/add-book", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Book addBook(@RequestBody Book book, BindingResult result) {
        if(result.hasErrors()) return null;
        bookRepository.save(book);
        Author author = authorRepository.findById(book.getAuthorId()).get();
        author.addBook(book.getId());
        authorRepository.save(author);
        return book;
    }
}
