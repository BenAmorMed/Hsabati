class User {
  final String id;
  final String email;
  final String? name;
  final String currency;

  User({
    required this.id,
    required this.email,
    this.name,
    this.currency = 'USD',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      currency: json['currency'] ?? 'USD',
    );
  }
}

class Transaction {
  final String id;
  final String type;
  final double amount;
  final String? description;
  final DateTime date;
  final String? categoryId;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    this.description,
    required this.date,
    this.categoryId,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      type: json['type'],
      amount: (json['amount'] as num).toDouble(),
      description: json['description'],
      date: DateTime.parse(json['date']),
      categoryId: json['categoryId'],
    );
  }
}
