from ultralytics import YOLO

# Load the pretrained YOLO model once
model = YOLO("yolo11n.pt")


def detect_cat_dog(image_path):
    results = model(image_path)

    detections = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = result.names[class_id]

            if class_name in ["cat", "dog"]:
                detections.append({
                    "animal": class_name,
                    "confidence": confidence
                })

    return detections