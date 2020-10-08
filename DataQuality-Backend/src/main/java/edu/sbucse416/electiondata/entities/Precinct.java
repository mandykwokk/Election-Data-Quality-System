package edu.sbucse416.electiondata.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import java.util.List;
import java.util.Set;

@Entity
@NoArgsConstructor
@Setter
public class Precinct extends Region {
    private String stateName;
    private String districtName;
    private String countyName;
    private String originalGeometry;
    private Set<Integer> neighbors;
    private boolean isGhost;
    private List<Error> errors;
    private List<History> histories;

    public String getStateName() {
        return stateName;
    }

    public String getDistrictName() {
        return districtName;
    }

    public String getCountyName() {
        return countyName;
    }

    public String getOriginalGeometry() {
        return originalGeometry;
    }

    @ElementCollection
    @BatchSize(size = 600)
    public Set<Integer> getNeighbors() {
        return neighbors;
    }

    @Column(name="is_ghost")
    public boolean isGhost() {
        return isGhost;
    }

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "precinct")
    @JsonManagedReference
    @BatchSize(size = 400)
    public List<Error> getErrors() {
        return errors;
    }

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "precinct")
    @JsonManagedReference
    @BatchSize(size = 400)
    public List<History> getHistories() { return histories; }
}