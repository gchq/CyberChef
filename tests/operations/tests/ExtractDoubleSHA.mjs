/**
 * Double SHA extraction tests.
 *
 * @author dgoldenberg [virtualcurrency@mitre.org]
 * @copyright  MITRE 2023
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Extract Double SHA Artifacts - Basic - Addresses.",
        input: "1CK6KHY6MHgYvmRQ4PAafKYDrg1ejbH1cE\n"+ "138EKMWwCNeScgkBs7ujW4JAUkx5PJqE5c\n" + "138EKMWwCNeScgkBs7ujW4JAUkx5PJqE5d\n" +
        "37TKx6FKj3P7fAeVoVwKsy39DzFhyHnvnr\n" + "37TKx6FKj3P7fAeVoVwKsy39DzFhyHnvnq\n",
        expectedOutput: "1CK6KHY6MHgYvmRQ4PAafKYDrg1ejbH1cE\n" + "138EKMWwCNeScgkBs7ujW4JAUkx5PJqE5c\n" + "37TKx6FKj3P7fAeVoVwKsy39DzFhyHnvnr\n",
        recipeConfig: [
            {
                "op": "Extract Double SHA Artifacts",
                "args": []
            },
        ],
    },
    {
        name: "Extract Double SHA Artifacts - Basic - Extended Public Keys.",
        input: "xprv9s21ZrQH143K31GyMWKbByidYkgWYp6w8jv66FXRAF2LQPyDvFKNUz57Rdq9zw4avf11d1GQ71rtH1fvWxo8iHq5J3LwqxUjYGVhk7Tf9Z2\n" +
        "xprv9s21ZrQH143K31GyMWKbByidYkgWYp6w8jv66FXRAF2LQPyDvFKNUz57Rdq9zw4avf11d1GQ71rtH1fvWxo8iHq5J3LwqxUjYGVhk7Tf9Z3\n" +
        "xpub6CVS2FsjnyE9kTXw1jxaXdDwgGduEfCtF4JLHGbiL5GqamiaRnzAjKYCCcg2BTMgpqcudPsZX6WtaiJXNbwdWfSU657nduXSiFFgbGD1q7t\n" +
        "xpub6CVS2FsjnyE9kTXw1jxaXdDwgGduEfCtF4JLHGbiL5GqamiaRnzAjKYCCcg2BTMgpqcudPsZX6WtaiJXNbwdWfSU657nduXSiFFgbGD1q7x\n" +
        "Ltpv71G8qDifUiNesyvYoQNDLPwNk29NdonGYiwe3jur9tcRRCk6nt5vqpmmPQNAsehmqmaHhWuvG6ZYGWnzv5n7MQCRFcJ89uXmLf7boarssUN\n" +
        "Ltpv71G8qDifUiNesyvYoQNDLPwNk29NdonGYiwe3jur9tcRRCk6nt5vqpmmPQNAsehmqmaHhWuvG6ZYGWnzv5n7MQCRFcJ89uXmLf7boarssUQ\n" +
        "Ltub2b1CMTSWhX5jGKUYqyXJMpko827CQ6ixymV2KnvQ7xg3Egd1aSPYF2dm4Abdx2jsH3MgmfWFzPkC131ed8LH4814j9HT9SnwfU5fqZcg3UD\n" +
        "Ltub2b1CMTSWhX5jGKUYqyXJMpko827CQ6ixymV2KnvQ7xg3Egd1aSPYF2dm4Abdx2jsH3MgmfWFzPkC131ed8LH4814j9HT9SnwfU5fqZcg3Us\n",
        expectedOutput: "xprv9s21ZrQH143K31GyMWKbByidYkgWYp6w8jv66FXRAF2LQPyDvFKNUz57Rdq9zw4avf11d1GQ71rtH1fvWxo8iHq5J3LwqxUjYGVhk7Tf9Z2\n" +
        "xpub6CVS2FsjnyE9kTXw1jxaXdDwgGduEfCtF4JLHGbiL5GqamiaRnzAjKYCCcg2BTMgpqcudPsZX6WtaiJXNbwdWfSU657nduXSiFFgbGD1q7t\n" +
        "Ltpv71G8qDifUiNesyvYoQNDLPwNk29NdonGYiwe3jur9tcRRCk6nt5vqpmmPQNAsehmqmaHhWuvG6ZYGWnzv5n7MQCRFcJ89uXmLf7boarssUN\n" +
        "Ltub2b1CMTSWhX5jGKUYqyXJMpko827CQ6ixymV2KnvQ7xg3Egd1aSPYF2dm4Abdx2jsH3MgmfWFzPkC131ed8LH4814j9HT9SnwfU5fqZcg3UD\n",
        recipeConfig: [
            {
                "op": "Extract Double SHA Artifacts",
                "args": []
            },
        ],
    },
    {
        name: "Extract Double SHA Artifacts - Basic - Private Keys.",
        input: "KycSyYzEQvDEh2mBxVwj8igqsK5P1maqpRhmyZZZjC5vA443NfZP\n" +
        "KycSyYzEQvDEh2mBxVwj8igqsK5P1maqpRhmyZZZjC5vA443NfZQ\n" +
        "L4ecqwNqxgCUGdtL8Czup7eU71uxVNjqNsXfa3cCXSBvFoDRb2nf\n" +
        "L4ecqwNqxgCUGdtL8Czup7eU71uxVNjqNsXfa3cCXSBvFoDRb2nx\n" +
        "TBDvJMKM359XnzFUePjbJGmpDvDDZNTdTLzVJgbYBBK5hQSKikcZ\n" +
        "TBDvJMKM359XnzFUePjbJGmpDvDDZNTdTLzVJgbYBBK5hQSKikcs\n",
        expectedOutput: "KycSyYzEQvDEh2mBxVwj8igqsK5P1maqpRhmyZZZjC5vA443NfZP\n" + "L4ecqwNqxgCUGdtL8Czup7eU71uxVNjqNsXfa3cCXSBvFoDRb2nf\n" + "TBDvJMKM359XnzFUePjbJGmpDvDDZNTdTLzVJgbYBBK5hQSKikcZ\n",
        recipeConfig: [
            {
                "op": "Extract Double SHA Artifacts",
                "args": []
            },
        ],
    }
]);
