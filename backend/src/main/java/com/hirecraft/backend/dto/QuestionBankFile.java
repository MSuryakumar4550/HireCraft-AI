package com.hirecraft.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class QuestionBankFile {
    private String subject;
    private String batch;
    private String version;
    private String language;
    private List<InterviewQuestion> questions;
}

