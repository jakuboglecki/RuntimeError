CREATE TABLE Sale (
                      salaID INTEGER PRIMARY KEY AUTOINCREMENT,
                      Wydzial TEXT NOT NULL,
                      NrSal INTEGER NOT NULL,
                      FOREIGN KEY (Wydzial) REFERENCES Przedmiot(Wydzial)
);

CREATE TABLE Grupa (
                       NrGrupy INTEGER PRIMARY KEY AUTOINCREMENT,
                       Nazwa TEXT NOT NULL
);

CREATE TABLE Student (
                         NumerAlbumu INTEGER PRIMARY KEY AUTOINCREMENT,
                         NrGrupy INTEGER NOT NULL,
                         FOREIGN KEY (NrGrupy) REFERENCES Grupa(NrGrupy)
);

CREATE TABLE Przedmiot (
                           PrzedmiotID INTEGER PRIMARY KEY AUTOINCREMENT,
                           Nazwa TEXT NOT NULL,
                           Wydzial TEXT NOT NULL,
                           TypZajec TEXT,
                           ProwadzacyID INTEGER,
                           GrupaID INTEGER,
                           FOREIGN KEY (ProwadzacyID) REFERENCES Prowadzacy(ID),
                           FOREIGN KEY (GrupaID) REFERENCES Grupa(NrGrupy)
);

CREATE TABLE Prowadzacy (
                            ID INTEGER PRIMARY KEY AUTOINCREMENT,
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
                         GrupaID INTEGER NOT NULL,
                         FOREIGN KEY (ProwadzacyID) REFERENCES Prowadzacy(ID),
                         FOREIGN KEY (SalaID) REFERENCES Sale(NrSal),
                         FOREIGN KEY (PrzedmiotID) REFERENCES Przedmiot(PrzedmiotID),
                         FOREIGN KEY (GrupaID) REFERENCES Grupa(NrGrupy)
);
