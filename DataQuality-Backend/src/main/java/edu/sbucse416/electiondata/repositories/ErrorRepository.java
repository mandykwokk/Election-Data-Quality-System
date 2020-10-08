package edu.sbucse416.electiondata.repositories;

import edu.sbucse416.electiondata.entities.Error;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ErrorRepository extends JpaRepository<Error, Integer> {

}