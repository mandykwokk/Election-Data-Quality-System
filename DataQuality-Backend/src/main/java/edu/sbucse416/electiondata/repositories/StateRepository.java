package edu.sbucse416.electiondata.repositories;

import edu.sbucse416.electiondata.entities.State;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StateRepository extends JpaRepository<State, Integer> {

    State findByName(String name);

}