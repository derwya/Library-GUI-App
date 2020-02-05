package com.alex.domain;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Author {


    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    long id;

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    String surname;

    String bookIds;


    public Author(String name, String surname) {
        this.name = name;
        this.surname = surname;
    }

    public void addBook(long bookId) {
        bookIds += bookId;
        bookIds += ",";
    }

    public void removeBook(long bookId) {
        List<Long> ids = new ArrayList<>();
        List.of(this.bookIds.split(",")).forEach(el -> {
            if(el.matches("[0-9]+")) ids.add(Long.parseLong(el));
        });
        ids.remove(bookId);
        this.bookIds = "";
        ids.forEach(this::addBook);
    }

}
