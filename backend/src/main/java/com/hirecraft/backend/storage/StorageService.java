package com.hirecraft.backend.storage;

import java.io.InputStream;

/**
 * Storage service abstraction.
 * <p>
 * The concrete implementation will use Oracle Object Storage (OCI SDK).
 * This interface allows the storage provider to be swapped without changing business logic.
 * <p>
 * NOT YET IMPLEMENTED — OCI SDK dependency will be added in a future implementation phase.
 */
public interface StorageService {

    /**
     * Uploads an object to cloud storage and returns the object key.
     */
    String upload(String bucketName, String objectKey, InputStream content, String mimeType, long fileSize);

    /**
     * Generates a pre-signed URL for temporary access to a stored object.
     */
    String generatePresignedUrl(String bucketName, String objectKey, long expirationSeconds);

    /**
     * Deletes an object from cloud storage.
     */
    void delete(String bucketName, String objectKey);
}
