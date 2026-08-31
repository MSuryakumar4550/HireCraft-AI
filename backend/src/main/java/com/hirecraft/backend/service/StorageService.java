package com.hirecraft.backend.service;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;

public interface StorageService {
    
    /**
     * Stores the given file.
     * @param file The file to store
     * @return The unique file key or relative path used to identify the file
     */
    String store(MultipartFile file);

    /**
     * Retrieves the absolute path to a stored file.
     * @param filename The unique file key
     * @return Path to the file
     */
    Path load(String filename);
}
