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
import java.util.Date;

@Entity
@NoArgsConstructor
@Setter
public class Comment {
    private int id;
    private String content;
    private Date timestamp;
    private History history;

    public Comment(String content, Date timestamp, History history) {
        this.content = content;
        this.timestamp = timestamp;
        this.history = history;
    }

    @Id
    @GeneratedValue
    public int getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    @ManyToOne
    @JoinColumn(name="history_id")
    @JsonBackReference
    public History getHistory() {
        return history;
    }
}