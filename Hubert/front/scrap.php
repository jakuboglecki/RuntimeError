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
function scrapGrupy($pdo, $ssl_error = false, $clearTable = true, $addToBase = true) {
    try {
        // Pobierz istniejące nazwy grup z bazy danych
        $existingGroups = $pdo->query("SELECT nazwagrupy FROM Grupa")->fetchAll(PDO::FETCH_COLUMN);

        // Wyczyść tabelę, jeśli wymagane
        if ($clearTable) {
            $pdo->exec("DELETE FROM Grupa; DELETE FROM sqlite_sequence WHERE name = 'Grupa'");
        }

        // Przygotuj daty (dziś i za miesiąc)
        $dateNow = (new DateTime())->format("Y-m-d");
        $dateMonth = (new DateTime("+1 month"))->format("Y-m-d");

        // Buduj URL API
        $url = "https://plan.zut.edu.pl/schedule_student.php?subject=test&start={$dateNow}T00:00:00+01:00&end={$dateMonth}T00:00:00+01:00";

        // Pobierz dane z API
        $context = $ssl_error ? stream_context_create(["ssl" => ["verify_peer" => false, "verify_peer_name" => false]]) : null;
        $response = file_get_contents($url, false, $context);
        echo "Zwrot z API pobrany pomyślnie\n";

        // Dekoduj JSON
        $data = json_decode($response, true);
        if (!$data) {
            echo "Błąd: Pusta lub nieprawidłowa odpowiedź z API\n";
            return;
        }

        // Wyciągnij nazwy grup
        $newGroups = [];
        foreach ($data as $group) {
            if (isset($group["group_name"])) {
                $newGroups[] = $group["group_name"];
            }
        }
        $newGroups = array_unique($newGroups);

        // Połącz nowe i istniejące grupy
        $allGroups = array_unique(array_merge($existingGroups, $newGroups));

        // Wstaw grupy do bazy danych
        if ($addToBase) {
            $stmt = $pdo->prepare("INSERT INTO Grupa (nazwagrupy) VALUES (:nazwagrupy)");
            foreach ($allGroups as $groupName) {
                try {
                    $stmt->execute([':nazwagrupy' => $groupName]);
                } catch (PDOException $e) {
                    echo "Błąd podczas dodawania grupy: {$groupName} - " . $e->getMessage() . "\n";
                }
            }
        }

    } catch (Exception $e) {
        echo "Błąd: " . $e->getMessage() . "\n";
    }
}




// Funkcja scrapująca dane dla Student
// Funkcja scrapująca dane dla Student
function scrapStudent($pdo, $albumNumber, $ssl_error = false) {
    try {
        // Przygotowanie zakresu dat
        $dateNow = (new DateTime())->format("Y-m-d");
        $dateMonth = (new DateTime())->modify("+1 month")->format("Y-m-d");

        // Tworzenie URL do API
        $url = 'https://plan.zut.edu.pl/schedule_student.php?number=' . $albumNumber . "&start=" . $dateNow . "T00%3A00%3A00%2B01%3A00&end=" . $dateMonth . "T00%3A00%3A00%2B01%3A00";

        // Pobranie danych z API
        $context = $ssl_error ? stream_context_create([
            "ssl" => [
                "verify_peer" => false,
                "verify_peer_name" => false,
            ],
        ]) : null;

        $response = file_get_contents($url, false, $context);
        if (!$response) {
            echo "Błąd: Nie udało się pobrać danych z API\n";
            return;
        }

        echo "Pomyślnie otrzymano zwrot z API \n";
        $data = json_decode($response, true);
        if (!$data) {
            echo "Błąd: Pusta odpowiedź lub nieprawidłowy JSON\n";
            return;
        }

        // Przetwarzanie danych z API
        $groupsArray = [];
        foreach ($data as $group) {
            if (isset($group["group_name"])) {
                $groupsArray[] = $group["group_name"];
            }
        }
        $groupsArray = array_unique($groupsArray);

        // Dodanie danych do tabeli Student
        $sqlInsert = "INSERT INTO Student (NumerAlbumu, grupaID) VALUES (:NumerAlbumu, :grupaID)";
        $statement = $pdo->prepare($sqlInsert);

        foreach ($groupsArray as $groupName) {
            // Pobranie grupaID na podstawie nazwy grupy
            $sqlGroupID = "SELECT grupaID FROM Grupa WHERE nazwagrupy = :nazwa";
            $groupStmt = $pdo->prepare($sqlGroupID);
            $groupStmt->bindParam(':nazwa', $groupName, PDO::PARAM_STR);
            $groupStmt->execute();
            $groupIDResult = $groupStmt->fetch(PDO::FETCH_ASSOC);

            if ($groupIDResult) {
                $groupID = $groupIDResult['grupaID'];

                // Wstawienie danych do tabeli Student
                $statement->bindParam(':NumerAlbumu', $albumNumber, PDO::PARAM_INT);
                $statement->bindParam(':grupaID', $groupID, PDO::PARAM_INT);

                try {
                    $statement->execute();
                    echo "Dodano studenta: NumerAlbumu=$albumNumber, grupaID=$groupID\n";
                } catch (PDOException $e) {
                    echo "Błąd zapytania INSERT: " . $e->getMessage() . "\n";
                }
            } else {
                echo "Nie znaleziono grupy: " . $groupName . "\n";
            }
        }

    } catch (PDOException $e) {
        echo "Błąd połączenia lub przetwarzania: " . $e->getMessage() . "\n";
        exit();
    }
}

function scrapPrzedmiot($pdo, $ssl_error = false, $addToBase = true) {
    try {
        // Usuwanie starych danych z bazy przed rozpoczęciem scrapowania
        clearOldData($pdo);

        $url = "https://plan.zut.edu.pl/schedule.php?kind=subject&query=";

        if ($ssl_error) {
            $options = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $context = stream_context_create($options);
            $response = file_get_contents($url, false, $context);
        } else {
            $response = file_get_contents($url);
        }

        if (!$response) {
            echo "Błąd podczas pobierania danych z API (lista przedmiotów).\n";
            return;
        }

        echo "Pobrano listę przedmiotów z API.\n";

        $data = json_decode($response, true);

        if (!$data || !is_array($data)) {
            echo "Błąd w dekodowaniu JSON (lista przedmiotów).\n";
            return;
        }

        foreach ($data as $entry) {
            if (isset($entry["item"])) {
                $subjectName = $entry["item"];
                scrapSubjectDetails($pdo, $subjectName, $ssl_error, $addToBase);
            }
        }
    } catch (Exception $e) {
        echo "Wystąpił błąd: " . $e->getMessage() . "\n";
    }
}

function clearOldData($pdo) {
    try {
        // Czyszczenie danych w tabelach w odpowiedniej kolejności
        $pdo->exec("DELETE FROM Zajecia");
        $pdo->exec("DELETE FROM Przedmiot");
        $pdo->exec("DELETE FROM Prowadzacy");
        $pdo->exec("DELETE FROM Grupa");
        $pdo->exec("DELETE FROM Sale");
        $pdo->exec("DELETE FROM Student");
        $pdo->exec("DELETE FROM Album");

        // Resetowanie liczników AUTOINCREMENT
        $pdo->exec("DELETE FROM sqlite_sequence WHERE name='Zajecia'");
        $pdo->exec("DELETE FROM sqlite_sequence WHERE name='Przedmiot'");
        $pdo->exec("DELETE FROM sqlite_sequence WHERE name='Prowadzacy'");
        $pdo->exec("DELETE FROM sqlite_sequence WHERE name='Grupa'");
        $pdo->exec("DELETE FROM sqlite_sequence WHERE name='Sale'");
        $pdo->exec("DELETE FROM sqlite_sequence WHERE name='Student'");
        $pdo->exec("DELETE FROM sqlite_sequence WHERE name='Album'");

        echo "Stare dane zostały usunięte.\n";
    } catch (PDOException $e) {
        echo "Błąd podczas czyszczenia starych danych: " . $e->getMessage() . "\n";
        exit();
    }
}

function scrapSubjectDetails($pdo, $subject, $ssl_error = false, $addToBase = true) {
    try {
        // Ustawienie zakresu czasowego (miesiąc w przód)
        $startDate = new DateTime();
        $endDate = (new DateTime())->modify('+1 month');
        $start = $startDate->format('Y-m-d\T00%3A00%3A00%2B01%3A00');
        $end = $endDate->format('Y-m-d\T00%3A00%3A00%2B01%3A00');

        $subjectEncoded = urlencode($subject);
        $url = "https://plan.zut.edu.pl/schedule_student.php?subject=" . $subjectEncoded . "&start=" . $start . "&end=" . $end;

        if ($ssl_error) {
            $options = [
                "ssl" => [
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ],
            ];
            $context = stream_context_create($options);
            $response = file_get_contents($url, false, $context);
        } else {
            $response = file_get_contents($url);
        }

        if (!$response) {
            echo "Brak danych w odpowiedzi API dla przedmiotu: $subject\n";
            return;
        }

        echo "Odpowiedź API dla przedmiotu $subject: \n$response\n";

        $data = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "Błąd w dekodowaniu JSON: " . json_last_error_msg() . " dla przedmiotu: $subject\n";
            return;
        }

        if ($addToBase) {
            $sqlInsert = "INSERT INTO Przedmiot (Nazwa, Wydzial, TypZajec, ProwadzacyID, grupaID) 
                          VALUES (:nazwa, :wydzial, :typZajec, :prowadzacyID, :grupaID)";
            $statement = $pdo->prepare($sqlInsert);

            foreach ($data as $entry) {
                if (isset($entry["subject"])) {
                    $subjectName = $entry["subject"];
                    $lessonType = $entry["lesson_form"] ?? null;
                    $room = $entry["room"] ?? "Nieznany";
                    $teacher = $entry["worker"] ?? null;
                    $group = $entry["group_name"] ?? null;

                    $wydzial = explode(" ", $room)[0];

                    // Pobranie ID prowadzącego
                    $teacherID = null;
                    if ($teacher) {
                        $teacherName = explode(" ", $teacher, 2);
                        $teacherLastName = $teacherName[0] ?? null;
                        $teacherFirstName = $teacherName[1] ?? null;

                        $queryTeacherID = "SELECT ProwadzacyID FROM Prowadzacy WHERE Imie = :firstName AND Nazwisko = :lastName";
                        $teacherStmt = $pdo->prepare($queryTeacherID);
                        $teacherStmt->bindParam(':firstName', $teacherFirstName, PDO::PARAM_STR);
                        $teacherStmt->bindParam(':lastName', $teacherLastName, PDO::PARAM_STR);
                        $teacherStmt->execute();
                        $teacherID = $teacherStmt->fetch(PDO::FETCH_ASSOC)["ProwadzacyID"] ?? null;

                        // Jeśli prowadzący nie istnieje, dodaj go do tabeli
                        if ($teacherID === null && $teacherFirstName && $teacherLastName) {
                            $sqlInsertTeacher = "INSERT INTO Prowadzacy (Imie, Nazwisko) VALUES (:imie, :nazwisko)";
                            $teacherInsertStmt = $pdo->prepare($sqlInsertTeacher);
                            $teacherInsertStmt->bindParam(':imie', $teacherFirstName, PDO::PARAM_STR);
                            $teacherInsertStmt->bindParam(':nazwisko', $teacherLastName, PDO::PARAM_STR);
                            $teacherInsertStmt->execute();
                            $teacherID = $pdo->lastInsertId();
                        }
                    }

                    // Pobranie ID grupy
                    $groupID = null;
                    if ($group) {
                        $queryGroupID = "SELECT grupaID FROM Grupa WHERE nazwagrupy = :groupName";
                        $groupStmt = $pdo->prepare($queryGroupID);
                        $groupStmt->bindParam(':groupName', $group, PDO::PARAM_STR);
                        $groupStmt->execute();
                        $groupID = $groupStmt->fetch(PDO::FETCH_ASSOC)["grupaID"] ?? null;

                        // Jeśli grupa nie istnieje, dodaj ją do tabeli
                        if ($groupID === null) {
                            $sqlInsertGroup = "INSERT INTO Grupa (nazwagrupy) VALUES (:groupName)";
                            $groupInsertStmt = $pdo->prepare($sqlInsertGroup);
                            $groupInsertStmt->bindParam(':groupName', $group, PDO::PARAM_STR);
                            $groupInsertStmt->execute();
                            $groupID = $pdo->lastInsertId();
                        }
                    }

                    // Wstawienie przedmiotu
                    try {
                        $statement->bindParam(':nazwa', $subjectName, PDO::PARAM_STR);
                        $statement->bindParam(':wydzial', $wydzial, PDO::PARAM_STR);
                        $statement->bindParam(':typZajec', $lessonType, PDO::PARAM_STR);
                        $statement->bindParam(':prowadzacyID', $teacherID, PDO::PARAM_INT);
                        $statement->bindParam(':grupaID', $groupID, PDO::PARAM_INT);
                        $statement->execute();
                    } catch (PDOException $e) {
                        echo "Błąd podczas wstawiania do bazy: " . $e->getMessage() . "\n";
                    }
                }
            }
        }
    } catch (Exception $e) {
        echo "Wystąpił błąd: " . $e->getMessage() . "\n";
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

// Funkcja do scrapowania danych
function scrapStudentData($pdo, $ssl_error = false, $clearTableCondition = true, $addToBase = true) {
    try {
        $base_url = 'https://plan.zut.edu.pl/schedule_student.php?number={album_index}&start=2024-10-01T00%3A00%3A00%2B01%3A00&end=2025-11-01T00%3A00%3A00%2B01%3A00';

        // Czyści tabelę, jeśli warunek jest spełniony
        if ($clearTableCondition) {
            try {
                $pdo->exec("DELETE FROM Album");
                $pdo->exec("DELETE FROM sqlite_sequence WHERE name='Album'");
                echo "Tabela Student została wyczyszczona.\n";
            } catch (PDOException $e) {
                echo "Blad podczas czyszczenia tabeli: " . $e->getMessage();
                exit();
            }
        }

        // Pobieranie danych dla numerów albumów
        for ($album_index = 60000; $album_index >= 1; $album_index--) {
            $url = str_replace('{album_index}', $album_index, $base_url);

            // Pobieranie danych z API
            $response = false;
            if ($ssl_error) {
                $options = ["ssl" => ["verify_peer" => false, "verify_peer_name" => false]];
                $context = stream_context_create($options);
                $response = file_get_contents($url, false, $context);
            } else {
                $response = file_get_contents($url);
            }

            if (!$response) {
                echo "Brak odpowiedzi dla numeru albumu: $album_index\n";
                continue;
            }

            $data = json_decode($response, true);

            // Jeśli dane są niepuste, przetwarzamy
            if (count($data) > 0) {
                echo "Znaleziono dane dla numeru albumu: $album_index\n";

                // Domyślny numer grupy (jeśli istnieje w danych)
                $nrGrupy = null;
                foreach ($data as $entry) {
                    if (isset($entry['group_name'])) {
                        $nrGrupy = $entry['group_name'];
                        break; // Bierzemy pierwszą grupę
                    }
                }

                if (!$nrGrupy) {
                    echo "Brak numeru grupy dla numeru albumu: $album_index, pomijam.\n";
                    continue;
                }

                if ($addToBase) {
                    try {
                        // Wstawianie danych do tabeli Student
                        $stmt = $pdo->prepare("INSERT INTO Album (AlbumID, Numer) VALUES (:NumerAlbumu, :NumerAlbumu)");
                        $stmt->bindParam(':NumerAlbumu', $album_index, PDO::PARAM_INT);
                        #$stmt->bindParam(':NrGrupy', $nrGrupy, PDO::PARAM_STR);
                        $stmt->execute();
                        echo "Dodano rekord: NumerAlbumu=$album_index";
                    } catch (PDOException $e) {
                        echo "Błąd podczas wstawiania rekordu: " . $e->getMessage() . "\n";
                        exit();
                    }
                }
            }
        }

        echo "Scraping zakończony.\n";
    } catch (Exception $e) {
        echo "Błąd: " . $e->getMessage() . "\n";
        exit();
    }
}







// Twój kod do połączenia z bazą danych oraz wywołania funkcji scrapujących
// Upewnij się, że masz prawidłowe połączenie z bazą danych
try {
    // Przykład połączenia z bazą SQLite
    $pdo = new PDO('sqlite:baza.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Wywołanie funkcji scrapujących
    #scrapProwadzacy($pdo);
    #scrapSale($pdo);
    #scrapGrupy($pdo);;
    #scrapStudent($pdo, "53791");
    scrapPrzedmiot($pdo);
    #scrapZajecia($pdo);
    #scrapStudentData($pdo);
} catch (PDOException $e) {
    echo "Błąd połączenia: " . $e->getMessage();
}
?>
