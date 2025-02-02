import { ArgumentOutOfRangeException } from '@libs/exceptions';
import { AggregateRoot } from '@libs/ddd/domain/base-classes/aggregate-root.base';
import { UUID } from '@libs/ddd/domain/value-objects/uuid.value-object';
import { Result } from '@src/libs/ddd/domain/utils/result.util';
import { WalletNotEnoughBalanceError } from '../../errors/wallet.errors';

export interface CreateWalletProps {
  userId: UUID;
}

export interface WalletProps extends CreateWalletProps {
  balance: number;
}

export class WalletEntity extends AggregateRoot<WalletProps> {
  protected readonly _id: UUID;

  static create(create: CreateWalletProps): WalletEntity {
    const id = UUID.generate();
    // Setting a default role since it is not accepted during creation
    const props: WalletProps = { ...create, balance: 0 };
    const wallet = new WalletEntity({ id, props });

    return wallet;
  }

  deposit(amount: number): void {
    this.props.balance += amount;
    WalletEntity.validate(this.props);
  }

  withdraw(amount: number): Result<null, WalletNotEnoughBalanceError> {
    if (this.props.balance - amount < 0) {
      return Result.err(new WalletNotEnoughBalanceError());
    }
    this.props.balance -= amount;
    WalletEntity.validate(this.props);
    return Result.ok(null);
  }

  /**
   * Protects wallet invariant.
   */
  static validate(props: WalletProps): void {
    if (props.balance < 0) {
      throw new ArgumentOutOfRangeException(
        'Wallet balance cannot be less than 0',
      );
    }
  }
}
