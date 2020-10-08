package edu.sbucse416.electiondata.entities;

import lombok.NoArgsConstructor;
import lombok.Setter;
import javax.persistence.Entity;


@Entity
@NoArgsConstructor
@Setter
public class District extends Region {

    private String stateName;

    public String getStateName(){
        return stateName;
    }


}

