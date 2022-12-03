# Final Project Arsitektur dan Integrasi Sistem

## Kode Kelas

- 1 : SD kelas 1
- 2 : SD kelas 2
- 3 : SD kelas 3
- 4 : SD kelas 4
- 5 : SD kelas 5
- 6 : SD kelas 6
- 7 : SMP kelas 1
- 8 : SMP kelas 2
- 9 : SMP kelas 3
- 10 : SMA kelas 1
- 11 : SMA kelas 2
- 12 : SMA kelas 3
- 13 : UTBK

## Daftar API

### Registrasi

#### Request

**Endpoint** : POST /daftar
**Body Request** : nama_lengkap, email, password, kelas
**Authorization** : -

```JSON
{
  "nama_lengkap" : "Testing",
  "email" : "testing@gmail.com",
  "password" : "testing",
  "kelas" : 9
}
```

#### Response

```JSON
{
    "message": "Pendaftaran berhasil"
}
```

### Login

#### Request

**Endpoint** : POST /login
**Body Request** : email, password
**Authorization** : -

```JSON
{
  "email" : "testing@gmail.com",
  "password" : "testing",
}
```

#### Response

```JSON
{
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Njk5NzI5MTgsInVzZXJfaWQiOjgsImlhdCI6MTY2OTk2OTMxOH0.SLaOGHBbeyWqc4RtITwiR9xRnZv9P3LsKukcc6SL3wE"
  }
}
```

### Paket Pembelajaran

#### Request

**Endpoint** : GET /paket-pembelajaran
**Body Request** : -
**Authorization** : -

#### Response

```JSON
{
  "message": "Berhasil",
  "data" : [
    {
      "kelas": 12,
      "nama_paket" : "ruangbelajar SMA/SMK (Semester Genap + Persiapan PAS)",
      "deskripsi_paket": [
        "UTBK Center + PELATNAS UTBK",
        "Video belajar premium"
      ],
      "harga" : 498000,
      "masa_aktif_hingga" : "25/12/2022"
    }
  ]
}
```

### Account

#### Request

**Endpoint** : GET /profile

**Body Request** : -

**Authorization** : Bearer Token

#### Response

```JSON
{
  "message": "Berhasil",
  "data": {
    "nama_lengkap": "testing",
    "email": "testing@gmail.com",
    "kelas": 12
  }
}
```
