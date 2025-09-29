<?php
    session_start();
    session_unset();
    session_destroy();
    header("Location: /vizreload/public/index.php");
    exit;