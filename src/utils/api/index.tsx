import axios from "axios";

/**
 * Step 1: Request a signed URL from backend
 */
export const UploadPhoto = async (
    payload: any,
    token: string,
    file: File,
    type?: string
) => {
    try {
        const res = await axios.post(
            `https://listifyi-api-1012443530727.asia-south1.run.app/storage/signed-url`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (res?.data?.signedUrl && res?.data?.publicUrl) {
            const uploadRes = await UploadPhotoSignedUrl(
                res.data.signedUrl,
                payload.fileExtension,
                file,
                type
            );
            if (!uploadRes.ok) {
                throw new Error(`Upload failed with status ${uploadRes.status}`);
            }

            console.log("✅ File uploaded successfully!");
            return {
                fileUrl: res.data.publicUrl, // public or bucket URL returned by your backend
                status: "success",
            };
        } else {
            throw new Error("No signed URL received from server");
        }
    } catch (error) {
        console.error("❌ Error uploading photo:", error);
        throw error;
    }
};

/**
 * Step 2: Upload file using signed URL
 */
export const UploadPhotoSignedUrl = async (
    signedUrl: string,
    fileExtension: string,
    file: File,
    type?: string
) => {
    let contentType;
    if (type === "image") {
        contentType =
            fileExtension === "jpg" ? "image/jpeg" : `image/${fileExtension}`;
    } else if (type === "video") {
        if (fileExtension === "mov") {
            contentType = "video/quicktime";
        } else if (fileExtension === "mp4") {
            contentType = "video/mp4";
        } else if (fileExtension === "webm") {
            contentType = "video/webm";
        } else {
            contentType = `video/${fileExtension}`;
        }
    } else {
        // fallback if type is not passed
        contentType = `application/${fileExtension}`;
    }

    console.log("contentType", contentType);


    try {
        const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            headers: {
                "Content-Type": contentType,
            },
            body: file,
        });

        return uploadResponse;
    } catch (error) {
        console.error("❌ Error uploading to signed URL:", error);
        throw error;
    }
};


export const getAgentById = async (id: string, type: string, token: string) => {
    console.log("dataaaaaaaaa", id, type, token);
    try {
        let res
        if (type === "builder") {
            res = await axios.get(
                `https://listifyi-api-1012443530727.asia-south1.run.app/builders/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        } else {
            res = await axios.get(
                `https://listifyi-api-1012443530727.asia-south1.run.app/agents/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
        }
        return res.data
    } catch (error) {
        console.error("❌ Error uploading photo:", error);
        throw error;
    }
}