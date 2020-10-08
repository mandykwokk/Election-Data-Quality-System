package edu.sbucse416.electiondata.services;

import edu.sbucse416.electiondata.repositories.ErrorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import edu.sbucse416.electiondata.entities.Error;

@Service
public class ErrorService {

    @Autowired
    private ErrorRepository errorRepo;

    public void removeErrorById(int errorId) {
        errorRepo.deleteById(errorId);
    }

    public Error getErrorById(int id) {
        return errorRepo.findById(id).orElse(null);
    }

    public Error saveError(Error error) {
        return errorRepo.save(error);
    }

}