<?php
header('Content-Type: application/json');

$target_dir = "uploads/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

$file = $_FILES['image'];
$fileName = uniqid() . '_' . basename($file['name']);
$target_file = $target_dir . $fileName;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

// Check if image file is actual image
if(getimagesize($file["tmp_name"]) !== false) {
    if (move_uploaded_file($file["tmp_name"], $target_file)) {
        $url = 'https://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/' . $target_file;
        echo json_encode(['success' => true, 'url' => $url]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'File is not an image']);
}
?>
