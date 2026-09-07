package com.hirecraft.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper();
	}

	@Bean
	public CommandLineRunner schemaPatcher(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE interview_sessions ALTER COLUMN virtual_interview_id DROP NOT NULL");
			} catch (Exception ignored) {
			}
			try {
				jdbcTemplate.execute("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS evaluation_score NUMERIC(5,2)");
				jdbcTemplate.execute("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS question_id VARCHAR(100)");
				jdbcTemplate.execute("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS expected_topic VARCHAR(100)");
				jdbcTemplate.execute("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50)");
				jdbcTemplate.execute("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ DEFAULT NOW()");
				jdbcTemplate.execute("ALTER TABLE interview_answers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()");
				jdbcTemplate.execute("ALTER TABLE interview_answers ALTER COLUMN created_at DROP NOT NULL");
				jdbcTemplate.execute("ALTER TABLE interview_answers ALTER COLUMN answered_at DROP NOT NULL");
			} catch (Exception ignored) {
			}
		};
	}
}
