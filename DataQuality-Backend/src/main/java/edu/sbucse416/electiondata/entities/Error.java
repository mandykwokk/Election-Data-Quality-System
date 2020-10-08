package edu.sbucse416.electiondata.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import edu.sbucse416.electiondata.enums.ErrorType;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
@NoArgsConstructor
@Setter
public class Error {
    private int id;
    private ErrorType category;
    private String description;
    private Precinct precinct;

    @Id
    @GeneratedValue
    public int getId() {
        return id;
    }

    @Enumerated(EnumType.STRING)
    public ErrorType getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    @ManyToOne
    @JoinColumn(name="precinct_id")
    @JsonBackReference
    public Precinct getPrecinct() {
        return precinct;
    }
}