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

### Daftar

#### Request

- **Content-Type** : application/x-www-form-urlencoded
- **Endpoint** : POST /daftar
- **Body Request** : nama_lengkap, email, password, kelas
- **Authorization** : -

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

- **Content-Type** : application/x-www-form-urlencoded
- **Endpoint** : POST /login
- **Body Request** : email, password
- **Authorization** : -

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

- **Endpoint** : GET /paket-pembelajaran
- **Body Request** : -
- **Authorization** : -

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

### Diskon

#### Request

- **Endpoint** : GET /diskon
- **Body Request** : -
- **Authorization** : -

#### Response

```JSON
{
  "message": "Berhasil",
  "data": [
    {
        "kode_diskon": "SIBERLAKU",
        "tanggal_berakhir": "30/6/2023"
    },
    {
        "kode_diskon": "SINONBERLAKU",
        "tanggal_berakhir": "30/6/2021"
    }
  ]
}
```

### Profile

#### Request

- **Endpoint** : GET /profile
- **Body Request** : -
- **Authorization** : Bearer Token

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

### Paket Saya

#### Request

- **Endpoint** : GET /paket-saya
- **Body Request** : -
- **Authorization** : Bearer Token

#### Response

```JSON
{
  "message": "Berhasil",
  "data": [
    {
      "id_paket": 1,
      "nama_paket": "ruangbelajar SMA/SMK (Semester Genap + Persiapan PAS)",
      "harga_paket": 498000,
      "status": "Nonaktif"
    },
    {
      "id_paket": 3,
      "nama_paket": "ruangbelajar SMA/SMK + Roboguru Plus Premium (Semester Genap + Persiapan PAS)",
      "harga_paket": 799000,
      "status": "Aktif"
    }
  ]
}
```

### Pembelian

#### Request

- **Content-Type** : application/x-www-form-urlencoded
- **Endpoint** : POST /pembelian
- **Body Request** : id_paket, kode_diskon (opsional)
- **Authorization** : Bearer Token

```JSON
{
  "id_paket" : "6",
  "kode_diskon" : "SIBERLAKU",
}
```

#### Response

```JSON
{
    "message": "Pembelian berhasil"
}
```

### Pembayaran

#### Request

- **Content-Type** : application/x-www-form-urlencoded
- **Endpoint** : POST /checkout
- **Body Request** : id_pembelian, nominal_pembayaran, token
- **Authorization** : Bearer Token

> Token didapat dari hasil login ke Shopay

> Token Authorization berbeda dengan Token request body

#### Response

```JSON
{
    "message": "Pembayaran berhasil"
}
```

### Riwayat

#### Request

- **Endpoint** : GET /riwayat
- **Body Request** : -
- **Authorization** : Bearer Token

#### Response

```JSON
{
  "message": "Berhasil",
  "data": [
    {
      "id_pembelian": 6,
      "nama_paket": "ruangbelajar SMA/SMK (Semester Genap + Persiapan PAS)",
      "harga_pembelian": 498000,
      "status": "Sudah Dibayar"
    }
  ]
}
```

### Detail Riwayat

#### Request

- **Endpoint** : GET /riwayat/:id
- **Body Request** : -
- **Authorization** : Bearer Token

#### Response

```JSON
{
  "message": "Berhasil",
  "data": {
    "id_pembelian": 6,
    "nama_paket": "ruangbelajar SMA/SMK (Semester Genap + Persiapan PAS)",
    "harga_paket": 498000,
    "harga_pembelian": 498000,
    "status": "Sudah Dibayar",
    "metode_pembayaran": "testing"
  }
}
```