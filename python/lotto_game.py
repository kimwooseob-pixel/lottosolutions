import random
import time

def generate_lotto_numbers():
    """로또 번호 6개를 생성합니다."""
    return sorted(random.sample(range(1, 46), 6))

def print_lotto_numbers(numbers):
    """로또 번호를 예쁘게 출력합니다."""
    print("\n당첨 번호:", end=" ")
    for num in numbers:
        print(f"{num:2d}", end=" ")
    print("\n")

def play_lotto_game():
    """로또 게임을 실행합니다."""
    print("=== 로또 번호 맞추기 게임 ===")
    print("1부터 45까지의 숫자 중 6개를 맞추세요!")
    
    # 당첨 번호 생성
    winning_numbers = generate_lotto_numbers()
    
    # 사용자 입력 받기
    print("\n6개의 번호를 입력하세요 (1-45 사이의 숫자)")
    user_numbers = []
    for i in range(6):
        while True:
            try:
                num = int(input(f"{i+1}번째 번호 입력: "))
                if 1 <= num <= 45 and num not in user_numbers:
                    user_numbers.append(num)
                    break
                else:
                    print("1부터 45까지의 중복되지 않는 숫자를 입력해주세요.")
            except ValueError:
                print("올바른 숫자를 입력해주세요.")
    
    # 결과 확인
    user_numbers.sort()
    correct_count = len(set(winning_numbers) & set(user_numbers))
    
    print("\n=== 결과 ===")
    print("당첨 번호:", end=" ")
    for num in winning_numbers:
        print(f"{num:2d}", end=" ")
    print("\n")
    
    print("입력하신 번호:", end=" ")
    for num in user_numbers:
        print(f"{num:2d}", end=" ")
    print("\n")
    
    print(f"맞은 개수: {correct_count}개")
    
    # 등수 확인
    if correct_count == 6:
        print("🎉 1등 당첨! 🎉")
    elif correct_count == 5:
        print("🎉 2등 당첨! 🎉")
    elif correct_count == 4:
        print("🎉 3등 당첨! 🎉")
    elif correct_count == 3:
        print("🎉 4등 당첨! 🎉")
    elif correct_count == 2:
        print("🎉 5등 당첨! 🎉")
    else:
        print("아쉽네요. 다음 기회에 도전해보세요!")

if __name__ == "__main__":
    while True:
        play_lotto_game()
        play_again = input("\n다시 플레이하시겠습니까? (y/n): ")
        if play_again.lower() != 'y':
            print("게임을 종료합니다. 즐거운 시간 되셨나요?")
            break 