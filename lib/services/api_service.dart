import 'package:dio/dio.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://localhost:5000/api', // Replace with production URL later
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  void setToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  Future<Response> login(String email, String password) async {
    return await _dio.post('/auth/login', data: {'email': email, 'password': password});
  }

  Future<Response> register(String email, String password, String name) async {
    return await _dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      'name': name,
    });
  }

  Future<Response> getTransactions() async {
    return await _dio.get('/transactions');
  }

  Future<Response> createTransaction(Map<String, dynamic> data) async {
    return await _dio.post('/transactions', data: data);
  }

  Future<Response> getOverview() async {
    return await _dio.get('/analytics/overview');
  }
}
