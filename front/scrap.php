<?php

// Funkcja pomocnicza do wykonania zapytania SQL
function executeQuery($pdo, $query, $params = []) {
    try {
        $statement = $pdo->prepare($query);
        foreach ($params as $key => $value) {
            $statement->bindValue($key, $value);
        }
        $statement->execute();
    } catch (PDOException $e) {
        echo "Błąd zapytania: " . $e->getMessage();
        exit();
    }
}

// Funkcja scrapująca dane dla Prowadzacy
function scrapProwadzacy($pdo, $ssl_error = False, $clearTable = True, $insertData = True) {
    try {
        $url = 'https://plan.zut.edu.pl/schedule.php?kind=teacher&query=';

        // Obsługa SSL
        $context = null;
        if ($ssl_error) {
            $options = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $context = stream_context_create($options);
        }

        // Pobieranie danych
        $response = file_get_contents($url, false, $context);
        echo "Otrzymano dane z API.\n";
        $data = json_decode($response, true);

        // Czyszczenie tabeli Prowadzacy
        if ($clearTable) {
            executeQuery($pdo, "DELETE FROM Prowadzacy");
            executeQuery($pdo, "DELETE FROM sqlite_sequence WHERE name = 'Prowadzacy'");
            echo "Tabela Prowadzacy została wyczyszczona.\n";
        }

        // Dodawanie danych
        if ($insertData && !empty($data)) {
            foreach ($data as $person) {
                if (!empty($person['item'])) {
                    list($surname, $name) = explode(" ", $person['item'], 2);
                    $insertQuery = "INSERT INTO Prowadzacy (Imie, Nazwisko) VALUES (:imie, :nazwisko)";
                    $params = [':imie' => $name, ':nazwisko' => $surname];
                    executeQuery($pdo, $insertQuery, $params);
                    echo "Prowadzący: $surname, $name został dodany.\n";
                }
            }
        }
    } catch (Exception $e) {
        echo "Błąd: " . $e->getMessage();
    }
}

// Funkcja scrapująca dane dla Sale
function scrapSale($pdo, $ssl_error = false, $clearTable = true, $insertData = true) {
    try {
        $url = 'https://plan.zut.edu.pl/schedule.php?kind=room&query=';

        // Obsługa SSL
        $context = null;
        if ($ssl_error) {
            $options = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $context = stream_context_create($options);
        }

        // Pobieranie danych z API
        $response = file_get_contents($url, false, $context);
        echo "Otrzymano dane z API.\n";
        $data = json_decode($response, true);

        // Czyszczenie tabeli Sale
        if ($clearTable) {
            executeQuery($pdo, "DELETE FROM Sale");
            executeQuery($pdo, "DELETE FROM sqlite_sequence WHERE name = 'Sale'");
            echo "Tabela Sale została wyczyszczona.\n";
        }

        // Dodawanie danych do tabeli Sale
        if ($insertData && !empty($data)) {
            $recordCount = 0;
            foreach ($data as $room) {
                if (!empty($room['item'])) {
                    $item = $room['item'];

                    // Rozdziel wydział i numer sali (pierwsze słowo jako wydział, reszta jako sala)
                    $parts = explode(' ', $item, 2);
                    $wydzial = trim($parts[0]);
                    $nrSal = isset($parts[1]) ? trim($parts[1]) : '';

                    // Wstawianie danych do bazy
                    $insertQuery = "INSERT INTO Sale (Wydzial, NrSal) VALUES (:wydzial, :nrSal)";
                    $params = [':wydzial' => $wydzial, ':nrSal' => $nrSal];
                    executeQuery($pdo, $insertQuery, $params);
                    $recordCount++;
                    echo "Dodano salę: Wydział '$wydzial', Numer '$nrSal'.\n";
                }
            }
            echo "Łącznie dodano $recordCount sal.\n";
        }
    } catch (Exception $e) {
        echo "Błąd: " . $e->getMessage();
    }
}



// Funkcja scrapująca dane dla Grupa
function scrapGrupa($pdo, $ssl_error = False, $clearTable = True, $insertData = True) {
    try {
        $url = 'https://plan.zut.edu.pl/schedule.php?kind=group&query=';

        // Obsługa SSL
        $context = null;
        if ($ssl_error) {
            $options = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $context = stream_context_create($options);
        }

        // Pobieranie danych
        $response = file_get_contents($url, false, $context);
        echo "Otrzymano dane z API.\n";
        $data = json_decode($response, true);

        // Czyszczenie tabeli Grupa
        if ($clearTable) {
            executeQuery($pdo, "DELETE FROM Grupa");
            executeQuery($pdo, "DELETE FROM sqlite_sequence WHERE name = 'Grupa'");
            echo "Tabela Grupa została wyczyszczona.\n";
        }

        // Dodawanie danych
        if ($insertData && !empty($data)) {
            foreach ($data as $group) {
                if (!empty($group['item'])) {
                    $insertQuery = "INSERT INTO Grupa (Nazwa) VALUES (:nazwa)";
                    $params = [':nazwa' => $group['item']];
                    executeQuery($pdo, $insertQuery, $params);
                    echo "Grupa {$group['item']} została dodana.\n";
                }
            }
        }
    } catch (Exception $e) {
        echo "Błąd: " . $e->getMessage();
    }
}

// Funkcja scrapująca dane dla Student
function scrapStudent($pdo, $ssl_error = False, $clearTable = True, $insertData = True) {
    try {
        $url = 'https://plan.zut.edu.pl/schedule.php?kind=student&query=';

        // Obsługa SSL
        $context = null;
        if ($ssl_error) {
            $options = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $context = stream_context_create($options);
        }

        // Pobieranie danych
        $response = file_get_contents($url, false, $context);
        echo "Otrzymano dane z API.\n";
        $data = json_decode($response, true);

        // Czyszczenie tabeli Student
        if ($clearTable) {
            executeQuery($pdo, "DELETE FROM Student");
            executeQuery($pdo, "DELETE FROM sqlite_sequence WHERE name = 'Student'");
            echo "Tabela Student została wyczyszczona.\n";
        }

        // Dodawanie danych
        if ($insertData && !empty($data)) {
            foreach ($data as $student) {
                if (!empty($student['item'])) {
                    list($surname, $name) = explode(" ", $student['item'], 2);
                    $insertQuery = "INSERT INTO Student (Imie, Nazwisko) VALUES (:imie, :nazwisko)";
                    $params = [':imie' => $name, ':nazwisko' => $surname];
                    executeQuery($pdo, $insertQuery, $params);
                    echo "Student: $surname, $name został dodany.\n";
                }
            }
        }
    } catch (Exception $e) {
        echo "Błąd: " . $e->getMessage();
    }
}

// Funkcja scrapująca dane dla Przedmiot
function scrapPrzedmiot($pdo, $ssl_error = False, $clearTable = True, $insertData = True) {
    try {
        $url = 'https://plan.zut.edu.pl/schedule.php?kind=subject&query=';

        // Obsługa SSL
        $context = null;
        if ($ssl_error) {
            $options = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $context = stream_context_create($options);
        }

        // Pobieranie danych
        $response = file_get_contents($url, false, $context);
        echo "Otrzymano dane z API.\n";
        $data = json_decode($response, true);

        // Czyszczenie tabeli Przedmiot
        if ($clearTable) {
            executeQuery($pdo, "DELETE FROM Przedmiot");
            executeQuery($pdo, "DELETE FROM sqlite_sequence WHERE name = 'Przedmiot'");
            echo "Tabela Przedmiot została wyczyszczona.\n";
        }

        // Dodawanie danych
        if ($insertData && !empty($data)) {
            foreach ($data as $subject) {
                if (!empty($subject['item'])) {
                    $insertQuery = "INSERT INTO Przedmiot (Nazwa) VALUES (:nazwa)";
                    $params = [':nazwa' => $subject['item']];
                    executeQuery($pdo, $insertQuery, $params);
                    echo "Przedmiot {$subject['item']} został dodany.\n";
                }
            }
        }
    } catch (Exception $e) {
        echo "Błąd: " . $e->getMessage();
    }
}

// Funkcja scrapująca dane dla Zajecia
function scrapZajecia($pdo, $ssl_error = False, $clearTable = True, $insertData = True) {
    try {
        $url = 'https://plan.zut.edu.pl/schedule.php?kind=lesson&query=';

        // Obsługa SSL
        $context = null;
        if ($ssl_error) {
            $options = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $context = stream_context_create($options);
        }

        // Pobieranie danych
        $response = file_get_contents($url, false, $context);
        echo "Otrzymano dane z API.\n";
        $data = json_decode($response, true);

        // Czyszczenie tabeli Zajecia
        if ($clearTable) {
            executeQuery($pdo, "DELETE FROM Zajecia");
            executeQuery($pdo, "DELETE FROM sqlite_sequence WHERE name = 'Zajecia'");
            echo "Tabela Zajecia została wyczyszczona.\n";
        }

        // Dodawanie danych
        if ($insertData && !empty($data)) {
            foreach ($data as $lesson) {
                if (!empty($lesson['item'])) {
                    $insertQuery = "INSERT INTO Zajecia (Nazwa) VALUES (:nazwa)";
                    $params = [':nazwa' => $lesson['item']];
                    executeQuery($pdo, $insertQuery, $params);
                    echo "Zajęcia {$lesson['item']} zostały dodane.\n";
                }
            }
        }
    } catch (Exception $e) {
        echo "Błąd: " . $e->getMessage();
    }
}

// Twój kod do połączenia z bazą danych oraz wywołania funkcji scrapujących
// Upewnij się, że masz prawidłowe połączenie z bazą danych
try {
    // Przykład połączenia z bazą SQLite
    $pdo = new PDO('sqlite:baza.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Wywołanie funkcji scrapujących
    //scrapProwadzacy($pdo);
    scrapSale($pdo);
    scrapGrupa($pdo);
    scrapStudent($pdo);
    scrapPrzedmiot($pdo);
    scrapZajecia($pdo);
} catch (PDOException $e) {
    echo "Błąd połączenia: " . $e->getMessage();
}
?>
