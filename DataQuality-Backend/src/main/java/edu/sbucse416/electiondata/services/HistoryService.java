package edu.sbucse416.electiondata.services;

import edu.sbucse416.electiondata.entities.History;
import edu.sbucse416.electiondata.repositories.HistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HistoryService {

    @Autowired
    private HistoryRepository historyRepo;

    public History saveHistory(History history) {
        return historyRepo.save(history);
    }

    public History getHistoryById(int id) {
        return historyRepo.findById(id).orElse(null);
    };
}