package edu.sbucse416.electiondata.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import edu.sbucse416.electiondata.enums.ErrorType;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.util.Date;
import java.util.List;

@Entity
@NoArgsConstructor
@Setter
public class History {
    private int id;
    private ErrorType category;
    private String description;
    private Precinct precinct;
    private Date timestamp;
    private List<Comment> comments;

    public History(ErrorType category, String description, Precinct precinct, Date timestamp, List<Comment> comments) {
        this.category = category;
        this.description = description;
        this.precinct = precinct;
        this.timestamp = timestamp;
        this.comments = comments;
    }

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

    @Temporal(TemporalType.TIMESTAMP)
    public Date getTimestamp() {
        return timestamp;
    }

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "history", orphanRemoval = true)
    @JsonManagedReference
    @BatchSize(size = 400)
    public List<Comment> getComments() {
        return comments;
    }
}