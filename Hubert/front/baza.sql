CREATE TABLE Sale (
                      salaID INTEGER PRIMARY KEY AUTOINCREMENT,
                      Wydzial TEXT NOT NULL,
                      NrSal INTEGER NOT NULL,
                      FOREIGN KEY (Wydzial) REFERENCES Przedmiot(Wydzial)
);

CREATE TABLE Grupa (
                       grupaID INTEGER PRIMARY KEY AUTOINCREMENT,
                       nazwagrupy TEXT NOT NULL
);

CREATE TABLE Student (
                         studentID INTEGER PRIMARY KEY AUTOINCREMENT,
                         NumerAlbumu INTEGER NOT NULL,
                         grupaID INTEGER NOT NULL,
                         FOREIGN KEY (grupaID) REFERENCES Grupa(grupaID)
);

CREATE TABLE Przedmiot (
                           PrzedmiotID INTEGER PRIMARY KEY AUTOINCREMENT,
                           Nazwa TEXT NOT NULL,
                           Wydzial TEXT NOT NULL,
                           TypZajec TEXT,
                           ProwadzacyID INTEGER,
                           grupaID INTEGER,
                           FOREIGN KEY (ProwadzacyID) REFERENCES Prowadzacy(ProwadzacyID),
                           FOREIGN KEY (grupaID) REFERENCES Grupa(grupaID)
);

CREATE TABLE Prowadzacy (
                            ProwadzacyID INTEGER PRIMARY KEY AUTOINCREMENT,
                            Imie TEXT NOT NULL,
                            Nazwisko TEXT NOT NULL
);

CREATE TABLE Zajecia (
                         ZajeciaID INTEGER PRIMARY KEY AUTOINCREMENT,
                         Start DATETIME NOT NULL,
                         Koniec DATETIME NOT NULL,
                         ProwadzacyID INTEGER NOT NULL,
                         SalaID INTEGER NOT NULL,
                         PrzedmiotID INTEGER NOT NULL,
                         grupaID INTEGER NOT NULL,
                         FOREIGN KEY (ProwadzacyID) REFERENCES Prowadzacy(ProwadzacyID),
                         FOREIGN KEY (SalaID) REFERENCES Sale(NrSal),
                         FOREIGN KEY (PrzedmiotID) REFERENCES Przedmiot(PrzedmiotID),
                         FOREIGN KEY (grupaID) REFERENCES Grupa(grupaID)
);

CREATE TABLE Album (
                       AlbumID INTEGER PRIMARY KEY AUTOINCREMENT,
                       Numer INTEGER NOT NULL
);