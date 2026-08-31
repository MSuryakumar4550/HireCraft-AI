package com.hirecraft.backend.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class AptitudeQuestion {
    private Integer id;
    private String topic;
    private String questionText;
    private List<String> options;
    private String correctOption; // Only for internal validation, do not send to client unless needed
    private String explanation;
}
