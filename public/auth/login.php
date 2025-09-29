<?php
    session_start();
    require_once __DIR__ . '/../../config/conexion.php';
    require_once __DIR__ . '/../../config/config.php';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $username = $_POST['usuario'] ?? '';
        $password = $_POST['clave'] ?? '';
        $sql = "SELECT * FROM public.usuarios WHERE username = :username LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user'] = $user['username'];
            header("Location: " . BASE_URL . "home.php");
            exit;
        } else {
            $_SESSION['error'] = 'Credenciales inválidas';
            header('Location: ../index.php');
            exit;
        }
    } else {
        header('Location: ../index.php');
        exit;
    }