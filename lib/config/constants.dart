/// App-wide constants
class AppConstants {
  AppConstants._();

  static const String appName = 'Hsabati';
  static const String appVersion = '1.0.0';
  static const String defaultCurrency = 'MAD';
  static const String currencySymbol = 'DH';

  // Hive box names
  static const String transactionsBox = 'transactions';
  static const String walletsBox = 'wallets';
  static const String categoriesBox = 'categories';
  static const String advancedPaymentsBox = 'advanced_payments';
  static const String remindersBox = 'reminders';
  static const String settingsBox = 'settings';

  // Firestore collection names
  static const String usersCollection = 'users';
  static const String transactionsCollection = 'transactions';
  static const String walletsCollection = 'wallets';
  static const String categoriesCollection = 'categories';
  static const String advancedPaymentsCollection = 'advanced_payments';
  static const String remindersCollection = 'reminders';

  // Default categories
  static const List<Map<String, dynamic>> defaultExpenseCategories = [
    {'name': 'Food & Dining', 'icon': 'restaurant', 'color': 0xFFFF6B6B},
    {'name': 'Transport', 'icon': 'directions_car', 'color': 0xFF4ECDC4},
    {'name': 'Shopping', 'icon': 'shopping_bag', 'color': 0xFFFFE66D},
    {'name': 'Housing', 'icon': 'home', 'color': 0xFF95E1D3},
    {'name': 'Health', 'icon': 'favorite', 'color': 0xFFF38181},
    {'name': 'Entertainment', 'icon': 'movie', 'color': 0xFFAA96DA},
    {'name': 'Education', 'icon': 'school', 'color': 0xFF6C5CE7},
    {'name': 'Bills & Utilities', 'icon': 'receipt_long', 'color': 0xFFFFA502},
    {'name': 'Personal Care', 'icon': 'spa', 'color': 0xFFFF9FF3},
    {'name': 'Other', 'icon': 'more_horiz', 'color': 0xFF636E72},
  ];

  static const List<Map<String, dynamic>> defaultIncomeCategories = [
    {'name': 'Salary', 'icon': 'work', 'color': 0xFF00B894},
    {'name': 'Freelance', 'icon': 'laptop', 'color': 0xFF0984E3},
    {'name': 'Business', 'icon': 'business_center', 'color': 0xFF6C5CE7},
    {'name': 'Investment', 'icon': 'trending_up', 'color': 0xFFE17055},
    {'name': 'Gift', 'icon': 'card_giftcard', 'color': 0xFFFF6B6B},
    {'name': 'Other', 'icon': 'more_horiz', 'color': 0xFF636E72},
  ];
}
