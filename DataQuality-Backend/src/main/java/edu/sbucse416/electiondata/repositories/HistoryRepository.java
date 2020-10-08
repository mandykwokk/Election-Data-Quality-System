package edu.sbucse416.electiondata.repositories;

import edu.sbucse416.electiondata.entities.History;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoryRepository extends JpaRepository<History, Integer> {

}